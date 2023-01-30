const express = require("express");
const { body, param, query, validationResult } = require("express-validator");
const {
  isValidDeviceId,
  isValidTimeFormat,
  isISO8601,
} = require("../validators");
const db =
  process.env.JEST_WORKER_ID !== undefined
    ? require("../tests/mockQueries")
    : require("../db/queries");

const router = express.Router();

const isValidDate = (date) => {
  return !date ? true : isISO8601(date);
};

const getDataJson = async (deviceList, startDate, endDate, timeFormat) => {
  let data = {};
  for (const deviceId of deviceList) {
    const device = await db.getDataByID({
      deviceId: deviceId,
      startDate: startDate ? startDate : "",
      endDate: endDate ? endDate : "",
      timeFormat: timeFormat,
    });

    // Add new data entry for deviceId.
    if (device.length > 0) data[deviceId] = device;
  }

  return data;
};

router.post(
  "/",
  body("deviceList").isArray(),
  body("deviceList.*").custom(isValidDeviceId).trim().escape(),
  query("startDate").custom(isValidDate).trim().escape(),
  query("endDate").custom(isValidDate).trim().escape(),
  query("timeFormat").custom(isValidTimeFormat).trim().escape(),
  async (req, res) => {
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ errors: validationResult(req).array() });

    const deviceList =
      req.body.deviceList.length === 0
        ? (await db.getDevices()).map((x) => x.device_id)
        : req.body.deviceList;

    // Loop through device ids and gather data.
    const data = await getDataJson(
      deviceList,
      req.query.startDate,
      req.query.endDate,
      req.query.timeFormat
    );

    if (Object.keys(data).length === 0)
      return res.status(404).send("Data for devices not found.");

    return res.json(data);
  }
);

router.get(
  "/:id",
  param("id").custom(isValidDeviceId).trim().escape(),
  query("startDate").custom(isValidDate).trim().escape(),
  query("endDate").custom(isValidDate).trim().escape(),
  query("timeFormat").custom(isValidTimeFormat).trim().escape().exists(),
  async (req, res) => {
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ errors: validationResult(req).array() });

    const data = await getDataJson(
      [req.params.id],
      req.query.startDate,
      req.query.endDate,
      req.query.timeFormat
    );

    if (Object.keys(data).length === 0) {
      data[req.params.id] = [];
    }

    return res.json(data);
  }
);

router.get(
  "/monthly/:id",
  param("id").custom(isValidDeviceId).trim().escape(),
  query("startDate").custom(isValidDate).trim().escape(),
  query("endDate").custom(isValidDate).trim().escape(),
  async (req, res) => {
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ errors: validationResult(req).array() });
    const data = await db.getMonthlyDataByID({
      deviceId: req.params.id,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    });

    if (Object.keys(data).length === 0) {
      data[req.params.id] = [];
    }

    return res.json(data);
  }
);

module.exports = router;
