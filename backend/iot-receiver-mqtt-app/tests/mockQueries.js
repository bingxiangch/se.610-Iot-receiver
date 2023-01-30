var fs = require('fs')

const dev_path = "tests/devices.json"


function createFileIfNotExists(path) {
  // Creates JSON file if it does not exist.
  if (!fs.existsSync(path)) {
    // Writing empty object to the file.
    fs.writeFileSync(path, '{}', (err, res) => {
      if (err) console.error(err)
    })
  }
}

function insertShortTermDeviceData(data) {

  //console.log(data);

  try {
    // Creating the file if it does not exist.
    createFileIfNotExists(dev_path);
    // Reading file.
    const jsonFile = fs.readFileSync(dev_path);
    const devices = JSON.parse(jsonFile);
    // Checking that there is no collision with id.
    if (Object.keys(devices).includes(data.id)) {
      return false;
    }  else {
      // Creating new device.
      const device = {
        id: data.id,
        date: new Date().toISOString(),
        state: data.state,
        solar_energy: data.solarpanel.energy,
        solar_lux: data.solarpanel.lux,
        battery_capacity: data.batterypack.capasity,
        battery_charge: data.batterypack.charge,
        battery_power: data.batterypack.output_power,
        battery_voltage: data.batterypack.voltage,
        interface_switches: data.interface.switches
      };
      // Setting the device into the devices object with the id as the key.
      devices[data.id] = device;
      // Writing the file.
      fs.writeFileSync(dev_path, JSON.stringify(devices));
      return true;
    }
  }
  catch(err) {
    console.log(err);
    return false;
  }
};

module.exports = {
    insertShortTermDeviceData,
    dev_path,
    createFileIfNotExists,
}