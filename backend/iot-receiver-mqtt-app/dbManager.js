const Pool = require('pg').Pool
const config = require('./dbConfig')
const pool = new Pool(config)

// insert data to st_device_data table
async function insertShortTermDeviceData(data) {
  const params = [
    data.id,
    new Date().toISOString(),
    data.state,
    data.location,
    data.solarpanel.energy,
    data.solarpanel.lux,
    data.batterypack.capasity,
    data.batterypack.charge,
    data.batterypack.output_power,
    data.batterypack.voltage,
    data.interface.switches
  ]
  try {
    const devicesSql = `INSERT INTO devices (device_id, create_time, state, location, 
      energy_solar, lux_solar, capacity_battery, charge_battery, 
      output_battery, voltage_battery, switches) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON conflict(device_id)
      DO UPDATE SET
      create_time = $2, state = $3, location = $4, energy_solar = $5, 
      lux_solar = $6, capacity_battery = $7, 
      charge_battery = $8, output_battery = $9, voltage_battery = $10, switches = $11`
    await pool.query(devicesSql, params)

    const insertSql = `INSERT INTO "st_device_data" (device_id, create_time,
      state, location, energy_solar, lux_solar, capacity_battery, charge_battery, 
      output_battery, voltage_battery, switches)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
    await pool.query(insertSql, params)
    return true
  } catch (err) {
    console.error('Exception occured while inserting to database: ', err)
    return false
  }
}

module.exports = {
  insertShortTermDeviceData
}
