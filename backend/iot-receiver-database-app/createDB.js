const { Pool } = require("pg");
const pgtools = require("pgtools");
const config = require("./dbConfig");
const { hash } = require("bcrypt");

async function createDB() {
  try {
    await pgtools.createdb(
      {
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
      },
      config.database
    );
  } catch (err) {
    if (err.pgErr.code == "42P04") {
      console.error("Database " + config.database + " Already exists!");
      return;
    } else {
      console.error(err);
      process.exit(-1);
    }
  }

  console.log("Create database " + config.database + " was a success!");
}
async function createTable_st_device_data() {
  const pool = new Pool(config);
  const sql = `CREATE TABLE "st_device_data" (
    "id" SERIAL PRIMARY KEY NOT NULL,
    "device_id" varchar(50) NOT NULL,
    "create_time" timestamptz NOT NULL,
    "location" json NOT NULL,
    "energy_solar" float NOT NULL,
    "lux_solar" float NOT NULL,
    "capacity_battery" int NOT NULL,
    "charge_battery" float NOT NULL,
    "output_battery" float NOT NULL,
    "voltage_battery" float NOT NULL,
    "switches" json NOT NULL,
    "state" varchar(20) NOT NULL
  );`;

  await pool.query(sql, function (err, res) {
    if (err) {
      if (err.code == "42P07") {
        console.error("Table st_device_data Already exists!");
      } else {
        console.error(err);
        process.exit(-1);
      }
    } else {
      console.log("Create table st_device_data was a success!");
    }
  });
  await pool.end();
}
async function createDailyPartitionTable() {
  const pool = new Pool(config);
  let sql = "";
  for (let index = 1; index <= 31; index++) {
    // Creating zero padded number
    let day = String(index).padStart(2, "0");
    sql =
      sql +
      `create table if not exists st_device_data_d` +
      day +
      `(
      check((extract(day from "create_time")) >=` +
      index +
      ` and (extract(day from "create_time")) < ` +
      (index + 1) +
      `)
      )inherits (st_device_data);
      create index timestamp_d` +
      index +
      `_idx on st_device_data_d` +
      day +
      `("create_time");\n\n`;
  }
  await pool.query(sql, function (err, res) {
    if (err) {
      if (err.code == "42P07") {
        console.error(
          "Daily partitioning st_device_data table Already exists!"
        );
      } else {
        console.error(err);
        process.exit(-1);
      }
    } else {
      console.log(
        "Create daily partitioning st_device_data table was a success!"
      );
    }
  });
  await pool.end();
}

async function partition_table() {
  const pool = new Pool(config);
  const st_sql = `
  create or replace function getTableTime(tbl_name text)
  returns timestamptz as $tableTime$
  declare
  tableTime timestamptz;
  begin
      EXECUTE format('select create_time from %s LIMIT 1', tbl_name) INTO tableTime;
      return tableTime;
  end;
  
  $tableTime$ language plpgsql;
  CREATE OR REPLACE FUNCTION st_device_data_trigger()
    RETURNS TRIGGER AS $$
  DECLARE day_text TEXT;
          insert_statement TEXT;
          truncate_statement TEXT;
          table_time TIMESTAMPTZ;
  BEGIN
    SELECT to_char(NEW.create_time, 'DD') INTO day_text;
    insert_statement := 'INSERT INTO st_device_data_d'
                        || day_text||' VALUES ($1.*)';
    truncate_statement := 'TRUNCATE st_device_data_d'
                          || day_text;
    SELECT to_date(to_char(getTableTime('st_device_data_d' || day_text) + interval '1 month', 'YYYY-MM-DD'),'YYYY-MM-DD') INTO table_time;
    IF NEW.create_time > table_time
    then EXECUTE truncate_statement;
      EXECUTE insert_statement USING NEW;
      return NULL;
    ELSE   
     EXECUTE insert_statement USING NEW;
     return NULL;
    END IF;
  END;
  $$
  LANGUAGE plpgsql;
  
  /*step2(Create Trigger): */
  CREATE TRIGGER insert_st_device_data_trigger
  BEFORE INSERT ON st_device_data
  FOR EACH ROW EXECUTE PROCEDURE st_device_data_trigger();`;
  await pool.query(st_sql, function (err, res) {
    if (err) {
      if (err.code == "42710") {
        console.error(
          "Daily partitioning function and trigger Already exists!"
        );
      } else {
        console.error(err);
        process.exit(-1);
      }
    } else {
      console.log(
        "Create daily partitioning function and trigger was a success!"
      );
    }
  });
  await pool.end();
}

async function createTable_lt_device_data() {
  const pool = new Pool(config);
  const sql = `
  CREATE TABLE "lt_device_data" (
    "id" SERIAL PRIMARY KEY NOT NULL,
    "device_id" varchar(50) NOT NULL,
    "create_time" timestamptz NOT NULL,
    "location" json NOT NULL,
    "energy_solar_sum" float NOT NULL,
    "energy_solar_avg" float NOT NULL,
    "energy_solar_min" float NOT NULL,
    "energy_solar_max" float NOT NULL,
    "energy_solar_min_timestamp" timestamptz,
    "energy_solar_max_timestamp" timestamptz,
    "lux_solar_avg" float NOT NULL,
    "lux_solar_min" float NOT NULL,
    "lux_solar_max" float NOT NULL,
    "lux_solar_min_timestamp" timestamptz,
    "lux_solar_max_timestamp" timestamptz,
    "charge_battery_avg" float NOT NULL,
    "charge_battery_min" float NOT NULL,
    "charge_battery_max" float NOT NULL,
    "charge_battery_min_timestamp" timestamptz,
    "charge_battery_max_timestamp" timestamptz,
    "output_battery_sum" float NOT NULL,
    "output_battery_avg" float NOT NULL,
    "output_battery_min" float NOT NULL,
    "output_battery_max" float NOT NULL,
    "output_battery_min_timestamp" timestamptz,
    "output_battery_max_timestamp" timestamptz,
    "plugoffrate1" float,
    "plugoffrate2" float,
    "operational_rate" float,
		"shutdown_rate" float,
		"fault_rate" float
  );`;
  await pool.query(sql, function (err, res) {
    if (err) {
      if (err.code == "42P07") {
        console.error("Table lt_device_data Already exists!");
      } else {
        console.error(err);
        process.exit(-1);
      }
    } else {
      console.log("Create table lt_device_data was a success!");
    }
  });
  await pool.end();
}
async function createTable_user_account() {
  const pool = new Pool(config);
  const sql = `CREATE TABLE user_account (
    "id" serial primary key NOT NULL,
    "username" varchar(50) NOT NULL UNIQUE,
    "password" varchar(60) NOT NULL, 
    "role" varchar(20) NOT NULL,
    "token" varchar(500)
  );`;
  await pool.query(sql, function (err, res) {
    if (err) {
      if (err.code == "42P07") {
        console.error("Table user_account Already exists!");
      } else {
        console.error(err);
        process.exit(-1);
      }
    } else {
      console.log("Create table user_account was a success!");
    }
  });
  await pool.end();
}
async function createTable_devices() {
  const pool = new Pool(config);
  const sql = `CREATE TABLE "devices" (
    "device_id" varchar(50) PRIMARY KEY NOT NULL,
    "name" varchar(50),
    "create_time" timestamptz NOT NULL,
    "location" json NOT NULL,
    "energy_solar" float NOT NULL,
    "lux_solar" float NOT NULL,
    "capacity_battery" int NOT NULL,
    "charge_battery" float NOT NULL,
    "output_battery" float NOT NULL,
    "voltage_battery" float NOT NULL,
    "switches" json NOT NULL,
    "state" varchar(20) NOT NULL
  );`;
  await pool.query(sql, function (err, res) {
    if (err) {
      if (err.code == "42P07") {
        console.error("Table devices Already exists!");
      } else {
        console.error(err);
        process.exit(-1);
      }
    } else {
      console.log("Create table devices was a success!");
    }
  });
  await pool.end();
}
async function addForeignKey() {
  const pool = new Pool(config);
  const altersql1 = `ALTER TABLE "lt_device_data" ADD FOREIGN KEY ("device_id") REFERENCES "devices" ("device_id");`;
  const altersql2 = `ALTER TABLE "st_device_data" ADD FOREIGN KEY ("device_id") REFERENCES "devices" ("device_id");`;
  const result = await pool.query(altersql1);
  await pool.query(altersql2);
  await pool.end();
}

async function createDefaultUser() {
  const pool = new Pool(config);
  const hashed = await hash(config.adminPass, 11);
  const sql = `INSERT INTO user_account(username,password,role) VALUES (
    '${config.adminUser}', '${hashed}', 'admin_user');`;

  pool.query(sql, function (err, res) {
    if (err) {
      if (err.code == "23505") {
        console.error("Default user Already exists!");
      } else {
        console.error(err);
        process.exit(-1);
      }
    } else {
      console.log("Create default user was a success!");
    }
  });
  await pool.end();
}

(async () => {
  // Running database creation commands if environment variable is set to true.
  if (String(config.createDatabase) === "true") {
    await createDB();
    await createTable_st_device_data();
    await createTable_lt_device_data();
    await createDailyPartitionTable();
    await partition_table();
    await createTable_user_account();
    await createDefaultUser();
    await createTable_devices();
    await addForeignKey();
  } else {
    console.log("Skipped database creation.");
  }
})();
