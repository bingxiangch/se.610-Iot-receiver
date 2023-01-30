/**
 * Regex to test if id is a valid id.
 * @param {string} value
 * @returns {boolean}
 */
const isValidDeviceId = (value) => {
  //0183d5fe-029b-7a20-94bd-7e5234dd6b18
  return /^[a-z\d]{8}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{4}-[a-z\d]{12}$/.test(
    value
  );
};

const isValidTimeFormat = (time) => {
  return ["minute", "hour", "day", "week", "month"].includes(time);
};

/**
 * Regex to test if date is in ISO8601 format.
 * @param {string} value
 * @returns {boolean}
 */
const isISO8601 = (value) => {
  if (value.length != 25) return false;
  // eslint-disable-next-line max-len, no-useless-escape
  return /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/.test(value);
};

module.exports = { isValidDeviceId, isValidTimeFormat, isISO8601 };
