var fs = require("fs");
const tempUsersPath = "tests/tempUsers.json";

const deviceDataPath = "tests/testDevices.json";
const deviceFile = fs.readFileSync(deviceDataPath);
const deviceData = JSON.parse(deviceFile);

function createFileIfNotExists(path) {
  // Creates JSON file if it does not exist.
  if (!fs.existsSync(path)) {
    // Writing empty object to the file.
    fs.writeFileSync(path, "{}", (err, res) => {
      if (err) console.error(err);
    });
  }
}

async function createUser(data) {
  try {
    // Creating the file if it does not exist.
    createFileIfNotExists(tempUsersPath);
    // Reading file.
    const jsonFile = fs.readFileSync(tempUsersPath);
    const users = JSON.parse(jsonFile);
    // Checking that there is no collision with username.
    if (Object.keys(users).includes(data.username)) {
      return false;
    } else {
      // Creating new user.
      const user = {
        username: data.username,
        password: data.password,
        role: data.role,
        // Generating random id.
        id: Math.floor(Math.random() * (100000 - 1 + 1)) + 1,
      };
      // Setting the user into the users object with the username as the key.
      users[data.username] = user;
      // Writing the file.
      fs.writeFileSync(tempUsersPath, JSON.stringify(users));
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

async function getUsers() {
  const jsonFile = fs.readFileSync(tempUsersPath);
  // Return all users from the file.
  return (users = Object.values(JSON.parse(jsonFile)));
}

async function getUserByUserName(data) {
  const jsonFile = fs.readFileSync(tempUsersPath);
  const users = JSON.parse(jsonFile);
  // Returning matching user from the file.
  const user = users[data.username];
  // If no matching user was found, return empty array.
  if (!user) return [];
  return [user];
}

async function editUser(data) {
  try {
    // Reading json file
    const jsonFile = fs.readFileSync(tempUsersPath);
    const users = JSON.parse(jsonFile);
    // If username was provided, then go here.
    if (data.username) {
      // Set properties of the object
      users[data.username].username = data.username;
      users[data.username].password = data.password;
      users[data.username].role = data.role;
      users[data.username].token = data.token;
      users[data.username].id = data.id;
    } else {
      // If username was not provided, then find the user by id
      const match = Object.values(users).filter((x) => {
        return x.id == data.id;
      })[0];
      // Use the found user's username to modify the object
      users[match.username] = {
        username: match.username,
        password: match.password,
        role: match.role,
        token: data.token,
        id: data.id,
      };
      // If token was not provided, it needs to be deleted.
      if (!data.token) delete users[match.username].token;
    }
    // Writing the modified users list to the file.
    fs.writeFileSync(tempUsersPath, JSON.stringify(users));
    return true;
  } catch (err) {
    console.log("IO error: ", err);
    return false;
  }
}

async function deleteUser(data) {
  try {
    const jsonFile = fs.readFileSync(tempUsersPath);
    const users = JSON.parse(jsonFile);
    // Deleting the matching user object.
    delete users[data.username];
    // Writing users back to file.
    fs.writeFileSync(tempUsersPath, JSON.stringify(users));
    return true;
  } catch (err) {
    console.log("IO error: ", err);
    return false;
  }
}

//get all the latest device information from st_device_data
async function getDevices(data) {
  return !data.state
    ? deviceData.devices
    : deviceData.devices.filter((x) => x.state === data.state);
}

async function getDeviceByID(data) {
  const device = deviceData.devices.find((x) => x.device_id === data.deviceId);
  return !device ? [] : [device];
}

async function getDataByID(data) {
  const res = deviceData.data[data.deviceId];
  return !res ? [] : res;
}

async function getMonthlyDataByID(data) {
  return (results = { rowCount: 1, rows: [{}] });
}

async function getDataByCoordinateBounds(data) {
  return deviceData.devices.filter(
    (x) =>
      x.location.lat > data.bottomLeftLat &&
      x.location.lat < data.topRightLat &&
      x.location.long > data.bottomLeftLong &&
      x.location.long < data.topRightLong
  );
}

module.exports = {
  createUser,
  getUsers,
  getUserByUserName,
  editUser,
  deleteUser,
  getDevices,
  getDeviceByID,
  getDataByID,
  getMonthlyDataByID,
  getDataByCoordinateBounds,
  tempUsersPath,
};
