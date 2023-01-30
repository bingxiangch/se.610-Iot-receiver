const Pool = require("pg").Pool;
const format = require("pg-format");
const config = require("../dbConfig");
const pool = new Pool(config);

async function createUser(data) {
  const params = [data.username, data.password, data.role];
  try {
    const sql = `INSERT INTO user_account (username, password, role) 
        VALUES ($1,$2,$3)`;
    await pool.query(sql, params);
    return true;
  } catch (err) {
    console.error("Exception occured while inserting to database: ", err);
    return false;
  }
}

async function getUsers() {
  try {
    const sql = "SELECT id, username, role FROM user_account ORDER BY id ASC";
    const results = await pool.query(sql);
    return results.rows;
  } catch (err) {
    console.error("Exception occured while selecting from database: ", err);
    return null;
  }
}

async function getUserByUserName(data) {
  const params = [data.username];
  let results;
  try {
    const sql = "SELECT * FROM user_account where username =  $1";
    results = await pool.query(sql, params);
    return results.rows;
  } catch (err) {
    console.error("Exception occured while selecting from database: ", err);
    return null;
  }
}

async function editUser(data) {
  const params = [data.username, data.password, data.role, data.token, data.id];
  try {
    // Using coalesce to select the first non-null value.
    const sql = `UPDATE user_account SET
        username = COALESCE($1, username),
        password = COALESCE($2, password),
        role = COALESCE($3, role),
        token = COALESCE($4)
        WHERE id = $5;`;
    await pool.query(sql, params);
    return true;
  } catch (err) {
    console.error("Exception occured while updating database: ", err);
    return false;
  }
}

async function deleteUser(data) {
  const params = [data.username];
  try {
    const sql = `delete from user_account where username = $1`;
    await pool.query(sql, params);
    return true;
  } catch (err) {
    console.error("Exception occured while deleting from database: ", err);
    return false;
  }
}

//get all the latest device information from st_device_data
async function getDevices(data) {
    const state = data.state
    try {
        if(!state) {
            const sql = `select device_id, create_time, location, state, charge_battery, energy_solar, output_battery, lux_solar from devices order by device_id` 
            const results = await pool.query(sql)
            return results.rows
        }
        else {
            const sql = `select device_id, create_time, location, state from devices
            where state = $1 order by device_id`  
            const results = await pool.query(sql, [state])
            return results.rows
        }
    } catch (err) {
        console.error('Exception occured while selecting from database: ', err)
        return null
    }
}

async function getDeviceByID(data) {
  const params = [data.deviceId];
  const sql = `select * from devices where device_id = $1`;
  try {
    const results = await pool.query(sql, params);
    return results.rows;
  } catch (err) {
    console.error("Exception occured while selecting from database: ", err);
    return null;
  }
}

//Leave startDate empty to query data from first date.
//Leave endDate empty to query data to current time
async function getDataByID(data) {
  const deviceId = data.deviceId;
  const startDate = data.startDate;
  const timeFormat = data.timeFormat; //minute, hour, day, week
  const endDate = !data.endDate ? "now()" : data.endDate;
  const prefixSql = ` SELECT * from 
    (SELECT date_trunc('%s', create_time) as time, 
    avg(output_battery) as total_output,
    avg(lux_solar) as lux_avg, avg(voltage_battery) as voltage_battery_avg,
    avg(energy_solar) as solar_energy_avg, avg(charge_battery) as avg_charge,
    count(id) as entries
    FROM st_device_data WHERE device_id= $1
    GROUP BY time`;
  try {
    let results;
    if (startDate === "") {
      const sql = format(
        `${prefixSql} ORDER BY time) as a where a.time < $2;`,
        timeFormat
      );
      results = await pool.query(sql, [deviceId, endDate]);
    } else {
      const sql = format(
        `${prefixSql} ORDER BY time) as a
        where a.time BETWEEN date_trunc('%s', $2::timestamp) and $3;`,
        timeFormat,
        timeFormat
      );
      results = await pool.query(sql, [deviceId, startDate, endDate]);
    }
    return results.rows;
  } catch (err) {
    console.error("Exception occured while selecting from database: ", err);
    return null;
  }
}

async function getMonthlyDataByID(data) {
  const deviceId = data.deviceId;
  const startDate = data.startDate;
  const endDate = !data.endDate ? "now()" : data.endDate;
  const sqlPrefix = `SELECT * FROM lt_device_data
  WHERE device_id=$1 AND create_time`;
  try {
    let results = null;
    if (!startDate || startDate === "") {
      const sql = `${sqlPrefix} < $2 order by id;`;
      results = await pool.query(sql, [deviceId, endDate]);
    } else {
      const sql = `${sqlPrefix} BETWEEN $2 and $3 order by id;`;
      results = await pool.query(sql, [deviceId, startDate, endDate]);
    }
    return results.rows;
  } catch (err) {
    console.error("Exception occured while selecting from database: ", err);
    return null;
  }
}

async function getDataByCoordinateBounds(data) {
  const params = [
    data.bottomLeftLat,
    data.topRightLat,
    data.bottomLeftLong,
    data.topRightLong,
  ];

  try {
    const sql = `
        select *  from
        (select * from devices as a 
        INNER JOIN 
        (select device_id, max(create_time) as create_time from devices
        group by device_id) as b 
        on a.device_id = b.device_id and a.create_time = b.create_time) as c
        where (c.location::jsonb->'lat')::float BETWEEN $1 and $2 
        and (c.location::jsonb->'long')::float BETWEEN $3 and $4`;
    const results = await pool.query(sql, params);
    return results.rows;
  } catch (err) {
    console.error("Exception occured while selecting from database: ", err);
    return null;
  }
}

async function editDeviceName(data) {
  const params = [data.name, data.deviceId];
  try {
    // Using coalesce to select the first non-null value.
    const sql = `UPDATE devices SET name = $1 WHERE id = $2;`;
    await pool.query(sql, params);
    return true;
  } catch (err) {
    console.error("Exception occured while updating database: ", err);
    return false;
  }
}

module.exports = {
  createUser,
  getUsers,
  getUserByUserName,
  editUser,
  deleteUser,
  getDevices,
  getDeviceByID,
  editDeviceName,
  getDataByID,
  getMonthlyDataByID,
  getDataByCoordinateBounds,
};
