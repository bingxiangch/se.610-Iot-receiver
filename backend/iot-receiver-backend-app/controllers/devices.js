const express = require("express");
const { param, query, validationResult } = require("express-validator");
const { isValidDeviceId } = require("../validators");
const db =
  process.env.JEST_WORKER_ID !== undefined
    ? require("../tests/mockQueries")
    : require("../db/queries");

const router = express.Router();

/**
 * Checks if device state is valid.
 * Null device state also returns true.
 * @param {string} state of device
 * @returns {boolean}
 */
const isValidState = (state) => {
  return !state ? true : ["Operational", "Shutdown", "Fault"].includes(state);
};

const isValidNumber = (number) => {
  return !number ? true : /^-?\d+$/.test(number);
};

router.get(
  "/",
  query("pageNumber").custom(isValidNumber).trim().escape(),
  query("pageSize").custom(isValidNumber).trim().escape(),
  query("state").custom(isValidState).trim().escape(),
  async (req, res) => {
    // Check if paramters returned errors.
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ errors: validationResult(req).array() });

    // Get devices from database.
    const devices = await db.getDevices({ state: req.query.state });
    
    if (devices.length === 0)
      return res.json({
        deviceCount: 0,
        devices: [],
      });

    // Check pagination parameters
    let pageNumber = 1;
    let pageSize = devices.length;

    if (req.query.pageNumber) pageNumber = parseInt(req.query.pageNumber);
    if (req.query.pageSize) pageSize = parseInt(req.query.pageSize);

    return res.json({
      deviceCount: devices.length,
      devices: devices.slice(
        pageSize * (pageNumber - 1),
        pageSize * pageNumber
      ),
    });
  }
);

router.get(
  "/location",
  query("bottomLeftLat").isFloat().toFloat().notEmpty().trim().escape(),
  query("topRightLat").isFloat().toFloat().notEmpty().trim().escape(),
  query("bottomLeftLong").isFloat().toFloat().notEmpty().trim().escape(),
  query("topRightLong").isFloat().toFloat().notEmpty().trim().escape(),
  async (req, res) => {
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ errors: validationResult(req).array() });

    const data = await db.getDataByCoordinateBounds(req.query);
    if (!data) return res.status(404).send("Devices not found");

    return res.send(data);
  }
);

router.get(
  "/:id",
  param("id").custom(isValidDeviceId).trim().escape(),
  async (req, res) => {
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ errors: validationResult(req).array() });

    const device = await db.getDeviceByID({ deviceId: req.params["id"] });

    if (device.length === 0) return res.status(404).send("Device not found.");

    return res.json(device);
  }
);

module.exports = router;
