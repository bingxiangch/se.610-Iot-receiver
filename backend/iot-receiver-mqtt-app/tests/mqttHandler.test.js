const mqttHandler = require('../mqttHandler')
const db = require('./mockQueries')
const test_data_file = "tests/test_data.json"
var fs = require('fs')

describe('mqttHandler', () => {

  afterAll(async () => {
    // Checks if file exists
    if (fs.existsSync(db.dev_path)) {
      // Deletes the file.
      fs.unlinkSync(db.dev_path);
    }
  });

  it('Check environment variables', async() => {

    const requiredKeys = ['MQTT_HOST', 'MQTT_PORT', 'MQTT_TOPIC']
    // Check that every key is present in environment variables.
    const allKeysPresent = requiredKeys.every((value) => {
      return value in process.env
    })

      expect(allKeysPresent).toEqual(true);
  })

  it('Check device data', async() => {
    // Reading files.
    const devices_json = fs.readFileSync(db.dev_path);
    const devices = JSON.parse(devices_json);
    const test_data_json = fs.readFileSync(test_data_file);
    const test_data = JSON.parse(test_data_json);

    const device = devices[test_data.id]

    expect(device.id).toEqual(test_data.id);
    expect(device.state).toEqual(test_data.state);
    expect(device.solar_energy).toEqual(test_data.solarpanel.energy);
    expect(device.battery_charge).toEqual(test_data.batterypack.charge);
  })

  it('Check if error was called', async() => {
    const errors = [];
    const error_path = "tests/error.log";

    // Reading file.
    const error_file = fs.readFileSync(error_path, 'utf8');
    error_file.split(/\r?\n/).forEach(line =>  {
      errors.push(line);
    });

    // Parse error
    test_error = JSON.parse(errors[0]);

    //console.log(test_error.level, test_error.message);
    expect(test_error.level).toEqual('error');
    expect(test_error.message).toEqual('Test error');

    if (fs.existsSync(error_path)) {
      // Deletes the file.
      fs.unlinkSync(error_path);
    }
  })
})
