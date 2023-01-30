const schedule = require("node-schedule");
const Pool = require('pg').Pool;
const config = require('./dbConfig')
const format = require('pg-format');
const pool = new Pool(config);

// Getting timeStamp base on different fields
async function getMaxorMinTimeStamp(operator, field) {
    try {
        const sql = format(
            `select a.device_id, MAX(a.create_time) as create_time from 
          (select * from st_device_data where create_time > date_trunc('month',current_date)) as a INNER JOIN
          (select device_id, %s(%s) as %s  
          from (select * from st_device_data where create_time > date_trunc('month',current_date)) as c
          group by device_id) as b
          on a.device_id=b.device_id 
          and a.%s=b.%s group by a.device_id`,
            operator,
            field,
            field,
            field,
            field
        )
        const results = await pool.query(sql)
        return results.rows
    } catch (err) {
        console.error('Exception occured while selecting from database: ', err)
        return null
    }
}

// Getting state rates
async function getStateRate() {
    try {
        const sql = `select a.device_id, round(( b.total /a.total::NUMERIC), 2) as operational_rate, d.rate::NUMERIC as shutdown_rate
        from (select device_id, count(state) as total 
        from (select * from st_device_data where create_time > date_trunc('month',current_date)) as c GROUP BY device_id) as a
        LEFT JOIN (select device_id, count(state) as total 
        from (select * from st_device_data where create_time > date_trunc('month',current_date)) as c where state = 'Operational' GROUP BY device_id) as b 
        on a.device_id = b.device_id
		LEFT JOIN 	
		(select a.device_id, round(( b.total /a.total::NUMERIC), 2) as rate 
        from (select device_id, count(state) as total 
        from (select * from st_device_data where create_time > date_trunc('month',current_date)) as c GROUP BY device_id) as a
        LEFT JOIN (select device_id, count(state) as total 
        from (select * from st_device_data where create_time > date_trunc('month',current_date)) as c where state = 'Shutdown' GROUP BY device_id) as b 
        on a.device_id = b.device_id) as d
		on a.device_id = d.device_id`
        const results = await pool.query(sql)
        return results.rows
    } catch (err) {
        console.error('Exception occured while selecting from database: ', err)
        return null
    }
}

// Getting plug off-rates
async function getSwitchesRate() {
    try {
        const sql = `
        select a.device_id, round((b.plug_1_state/a.plug_1_state::NUMERIC), 2) as plug1rate, c.rate as plug2rate
        from (select device_id, count(switches::jsonb->'plug_1') as plug_1_state 
        from (select * from st_device_data where create_time > date_trunc('month',current_date)) as d GROUP BY device_id) as a
        LEFT JOIN (select device_id, count(switches::jsonb->'plug_1') as plug_1_state 
        from (select * from st_device_data where create_time > date_trunc('month',current_date)) as d where switches::jsonb->'plug_1'->'state' = 'false' GROUP BY device_id) as b
        on a.device_id = b.device_id
        LEFT JOIN (select a.device_id, round((b.plug_2_state/a.plug_2_state::NUMERIC), 2) as rate 
        from (select device_id, count(switches::jsonb->'plug_1') as plug_2_state 
        from (select * from st_device_data where create_time > date_trunc('month',current_date)) as d GROUP BY device_id) as a
        LEFT JOIN (select device_id, count(switches::jsonb->'plug_2') as plug_2_state 
        from (select * from st_device_data where create_time > date_trunc('month',current_date)) as d where switches::jsonb->'plug_2'->'state' = 'false' GROUP BY device_id) as b
        on a.device_id = b.device_id) as c	
        on a.device_id = c.device_id`
        const results = await pool.query(sql)
        return results.rows
    } catch (err) {
        console.error('Exception occured while selecting from database: ', err)
        return null
    }
}

// Inserting data into lt_device_data table
async function insertLongTermDeviceData() {
    try {
        console.log('Adding values.')
        // Getting data from st_device_data table
        const shortTermSql = `
            select  a.device_id, date_trunc('month',current_date) as create_time, a.location, 
            c.energy_solar_sum, c.energy_solar_avg, c.energy_solar_min, c.energy_solar_max, 
            c.lux_solar_avg, c.lux_solar_min, c.lux_solar_max,
            c.charge_battery_avg, c.charge_battery_min, c.charge_battery_max,
            c.output_battery_sum, c.output_battery_avg, c.output_battery_min, c.output_battery_max
            from (select * from st_device_data where create_time > date_trunc('month',current_date)) as a 
            inner join 
            (select device_id, SUM(energy_solar/60) as energy_solar_sum, AVG(energy_solar) as energy_solar_avg, MIN(energy_solar) as energy_solar_min, MAX(energy_solar) as energy_solar_max, 
            AVG(lux_solar) as lux_solar_avg, MIN(lux_solar) as lux_solar_min, MAX(lux_solar) as lux_solar_max,  
            AVG(charge_battery) as charge_battery_avg, MIN(charge_battery) as charge_battery_min, MAX(charge_battery) as charge_battery_max, 
            SUM(output_battery/60) as output_battery_sum, AVG(output_battery) as output_battery_avg, MIN(output_battery) as output_battery_min, MAX(output_battery) as output_battery_max
            from (select * from st_device_data where create_time > date_trunc('month',current_date)) as d GROUP BY device_id) as c
            on a.device_id = c.device_id
            inner join 
            (select device_id, max(create_time) as create_time  
            from (select * from st_device_data where create_time > date_trunc('month',current_date)) as d group by device_id) as b
            on a.device_id=b.device_id 
            and a.create_time=b.create_time`
        const selectRes = await pool.query(shortTermSql)
        for (let i = 0; i < selectRes.rows.length; i++) {
            let params = [
                selectRes.rows[i].location,
                selectRes.rows[i].energy_solar_sum,
                selectRes.rows[i].energy_solar_avg,
                selectRes.rows[i].energy_solar_min,
                selectRes.rows[i].energy_solar_max,
                selectRes.rows[i].lux_solar_avg,
                selectRes.rows[i].lux_solar_min,
                selectRes.rows[i].lux_solar_max,
                selectRes.rows[i].charge_battery_avg,
                selectRes.rows[i].charge_battery_min,
                selectRes.rows[i].charge_battery_max,
                selectRes.rows[i].output_battery_sum,
                selectRes.rows[i].output_battery_avg,
                selectRes.rows[i].output_battery_min,
                selectRes.rows[i].output_battery_max,
                selectRes.rows[i].device_id
            ]
            let longTermSql = `select * from lt_device_data where device_id = $1 and create_time = date_trunc('month',current_date)`
            let longTermRes = await pool.query(longTermSql, [selectRes.rows[i].device_id])
            // Checking that there is a new dataset in lt_device_data
            if (!longTermRes.rows[0]) {
                // Inserting dataset
                const insertSql = `
                    insert into lt_device_data (device_id, create_time, location, 
                        energy_solar_sum, energy_solar_avg, energy_solar_min, energy_solar_max,
                        lux_solar_avg, lux_solar_min, lux_solar_max,
                        charge_battery_avg, charge_battery_min, charge_battery_max,
                        output_battery_sum, output_battery_avg, output_battery_min, output_battery_max)
                    values($16, date_trunc('month',current_date), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`
                await pool.query(insertSql, params)
            } else {
                // Updating datase
                let updateSql = `
                    update lt_device_data set location = $1, 
                    energy_solar_sum = $2, energy_solar_avg = $3, energy_solar_min = $4, energy_solar_max = $5, 
                    lux_solar_avg = $6, lux_solar_min = $7, lux_solar_max = $8,
                    charge_battery_avg = $9, charge_battery_min = $10, charge_battery_max = $11,
                    output_battery_sum = $12, output_battery_avg = $13, output_battery_min = $14, output_battery_max = $15
                    where device_id = $16 and create_time = date_trunc('month',current_date)`
                await pool.query(updateSql, params)
            }
        }
        console.log('Adding max and min value timestamps.')
        const timestampFields = [
            'energy_solar',
            'lux_solar',
            'charge_battery',
            'output_battery'
        ]
        let fields = []
        for (let i = 0; i < timestampFields.length * 2; i++) {
            const operator = i % 2 === 0 ? 'min' : 'max'
            const result = await getMaxorMinTimeStamp(
                operator,
                timestampFields[Math.floor(i / 2)]
            )
            fields.push(result)
        }

        let devSql = `SELECT DISTINCT(device_id) FROM st_device_data where create_time > date_trunc('month',current_date);`
        const res = await pool.query(devSql)
        for (let k = 0; k < res.rows.length; k++) {
            const timestamps = fields.map(
                (element) =>
                    element.filter(
                        (device) => device.device_id === res.rows[k].device_id
                    )[0].create_time
            )
            timestamps.push(res.rows[k].device_id)
            // Adding timestamp
            let timeStampSql = `update lt_device_data set energy_solar_min_timestamp = $1,
                            energy_solar_max_timestamp = $2, lux_solar_min_timestamp = $3,
                            lux_solar_max_timestamp = $4, charge_battery_min_timestamp = $5,
                            charge_battery_max_timestamp = $6, output_battery_min_timestamp = $7,
                            output_battery_max_timestamp = $8 where device_id=$9
                            and create_time = date_trunc('month',current_date)`
            await pool.query(timeStampSql, timestamps)
        }

        const rateRes = await getStateRate()
        console.log('Adding state rates.')
        // Adding state rates
        for (let i = 0; i < rateRes.length; i++) {
            const operationalRate = !rateRes[i].operational_rate
                ? 0
                : rateRes[i].operational_rate
            const shutdownRate = !rateRes[i].shutdown_rate ? 0 : rateRes[i].shutdown_rate
            let countSql = `update lt_device_data set operational_rate = $1, shutdown_rate = $2, fault_rate = $3 where device_id = $4 and create_time = date_trunc('month',current_date)`
            await pool.query(countSql, [
                operationalRate,
                shutdownRate,
                1 - operationalRate - shutdownRate,
                rateRes[i].device_id
            ])
        }
        console.log('Adding plug rates.')
        // Adding plug rates
        const plugRateRes = await getSwitchesRate()
        for (let i = 0; i < plugRateRes.length; i++) {
            const plug1Rate = !plugRateRes[i].plug1rate ? 0 : plugRateRes[i].plug1rate
            const plug2Rate = !plugRateRes[i].plug2rate ? 0 : plugRateRes[i].plug2rate
            let switchSql = `update lt_device_data set plugoffrate1 = $1, plugoffrate2 = $2 where device_id = $3 and create_time = date_trunc('month',current_date)`
            await pool.query(switchSql, [plug1Rate, plug2Rate, rateRes[i].device_id])
        }
        return true
    } catch (err) {
        console.error('Exception occured while inserting to database: ', err)
        return false
    }
}



async function moveToLongTermTable(){
    console.log("Starting to move data to long term table.")
    const result = await insertLongTermDeviceData()
    if(result == true){
        console.log('Move data from st_device_data to lt_device_data was a success.')
    }
    else{
       console.error('Move data from st_device_data to lt_device_data failed.')
    }
}

// Creating timing task
let rule  = new schedule.RecurrenceRule();
// Setting timing task on every day at 23:59:55
rule.second = 55;
rule.minute = 59;
rule.hour = 23;
schedule.scheduleJob(rule, function(){
    moveToLongTermTable();
});