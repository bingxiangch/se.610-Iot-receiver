const {
  isISO8601,
  isValidDeviceId,
  isValidTimeFormat,
} = require("../validators");

describe("Validators", () => {
  describe("isValidDeviceId", () => {
    it("should return true if id is valid", async () => {
      expect(isValidDeviceId("0183d5fe-029b-7a20-94bd-7e5234dd6b18")).toEqual(
        true
      );
    });

    it("should return false if id is not valid", async () => {
      expect(isValidDeviceId("0")).toEqual(false);
    });

    it("should return false if id is not valid", async () => {
      expect(isValidDeviceId("0183d5fe-029b-7a20-94bd-7e5234dd6b1")).toEqual(
        false
      );
    });
  });

  describe("isValidTimeFormat", () => {
    it("should return true if format is minute", async () => {
      expect(isValidTimeFormat("minute")).toEqual(true);
    });

    it("should return true if format is hour", async () => {
      expect(isValidTimeFormat("hour")).toEqual(true);
    });

    it("should return true if format is day", async () => {
      expect(isValidTimeFormat("day")).toEqual(true);
    });

    it("should return true if format is week", async () => {
      expect(isValidTimeFormat("week")).toEqual(true);
    });

    it("should return true if format is month", async () => {
      expect(isValidTimeFormat("month")).toEqual(true);
    });

    it("should return false if format is not valid", async () => {
      expect(isValidTimeFormat("year")).toEqual(false);
    });
  });

  describe("isISO8601", () => {
    it("should return true if date is ISO8601", async () => {
      expect(isISO8601("2022-12-03T23:24:52+00:00")).toEqual(true);
    });

    it("should return false if date is too short", async () => {
      expect(isISO8601("2022-12-03T23:19:45")).toEqual(false);
    });

    it("should return false if date is not valid", async () => {
        expect(isISO8601("2022-13-03T23:19:45")).toEqual(false);
      });
  });
});
