const index = require("../app");
const request = require("supertest");
const db = require("../tests/mockQueries");
const app = index;

const testUser = {
  username: "test_user",
  password: "12345",
  role: "basic_user",
};

describe("Devices", () => {
  let user_access;

  beforeAll(async () => {
    await db.createUser({
      username: "test_user",
      password: "$2b$10$4Zn8O3Z7uAD42A2sevQra.TlDQVhM23qA4CQKlQSNIJlzOzdYvV5e",
      role: "basic_user",
    });

    await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send(testUser)
      .then((res) => {
        user_access = res.body.accessToken;
      });

    //await db.createTempDevices();
  });

  describe("GET /devices", () => {
    it("should return a list of devices", async () => {
      const res = await request(app)
        .get("/devices")
        .set("Authorization", `Bearer ${user_access}`);
      expect(res.type).toEqual("application/json");
      expect(res.body.devices.length).toBeGreaterThan(0);
      expect(res.statusCode).toEqual(200);
    });

    it("should return number of devices", async () => {
      const res = await request(app)
        .get("/devices?pageNumber=1&pageSize=4")
        .set("Authorization", `Bearer ${user_access}`);
      expect(res.type).toEqual("application/json");
      expect(res.body.devices.length).toEqual(4);
      expect(res.statusCode).toEqual(200);
    });

    it("should return devices from other page", async () => {
      const res = await request(app)
        .get("/devices?pageNumber=2&pageSize=2")
        .set("Authorization", `Bearer ${user_access}`);
      expect(res.type).toEqual("application/json");
      expect(res.body.devices.length).toEqual(2);
      expect(res.statusCode).toEqual(200);
    });

    it("should return a empty list if no devices are found", async () => {
      const res = await request(app)
        .get("/devices?pageNumber=0&pageSize=0&state=Fault")
        .set("Authorization", `Bearer ${user_access}`);
      expect(res.type).toEqual("application/json");
      expect(res.body.devices.length).toEqual(0);
      expect(res.statusCode).toEqual(200);
    });

    it("should not allow invalid numbers", async () => {
      await request(app)
        .get("/devices?pageNumber=a&pageSize=4")
        .set("Authorization", `Bearer ${user_access}`)
        .expect(400);
    });

    it("should not allow invalid device state", async () => {
      await request(app)
        .get("/devices?pageNumber=a&pageSize=4&state=notavalidstate")
        .set("Authorization", `Bearer ${user_access}`)
        .expect(400);
    });

    it("should return devices with state", async () => {
      const res = await request(app)
        .get("/devices?pageNumber=1&pageSize=4&state=Operational")
        .set("Authorization", `Bearer ${user_access}`);
      expect(res.type).toEqual("application/json");
      expect(res.body.devices.length).not.toEqual(0);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("GET /devices/location", () => {
    it("should return 400 if coordinates are floats", async () => {
      const query =
        "?bottomLeftLat=a&topRightLat=90&bottomLeftLong=-90&topRightLong=90";
      request(app)
        .get("/devices/location" + query)
        .set("Authorization", `Bearer ${user_access}`)
        .expect(400);
    });

    it("should return 400 if coordinates are not valid", async () => {
      const query =
        "?bottomLeftLat=90&topRightLat=-90&bottomLeftLong=-90&topRightLong=90";
      request(app)
        .get("/devices/location" + query)
        .set("Authorization", `Bearer ${user_access}`)
        .expect(400);
    });

    it("should return empty list if no device are found", async () => {
      const query =
        "?bottomLeftLat=0&topRightLat=0&bottomLeftLong=0&topRightLong=0";
      const res = await request(app)
        .get("/devices/location" + query)
        .set("Authorization", `Bearer ${user_access}`);
      expect(res.body.length).toEqual(0);
      expect(res.statusCode).toEqual(200);
    });

    it("should return a list of devices inside bounds", async () => {
      const query =
        "?bottomLeftLat=-90&topRightLat=90&bottomLeftLong=-90&topRightLong=90";
      const res = await request(app)
        .get("/devices/location" + query)
        .set("Authorization", `Bearer ${user_access}`);
      expect(res.type).toEqual("application/json");
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("GET /devices/{id}", () => {
    it("should return 400 if id is not valid", async () => {
      await request(app)
        .get(`/devices/notadeviceid`)
        .set("Authorization", `Bearer ${user_access}`)
        .expect(400);
    });

    it("should return 404 if id is not found", async () => {
      await request(app)
        .get(`/devices/11111111-1111-1111-1111-111111111111`)
        .set("Authorization", `Bearer ${user_access}`)
        .expect(404);
    });

    it("should return a device", async () => {
      const devices = await request(app)
        .get("/devices")
        .set("Authorization", `Bearer ${user_access}`);

      const res = await request(app)
        .get(`/devices/${devices.body.devices[0].device_id}`)
        .set("Authorization", `Bearer ${user_access}`);
      expect(res.type).toEqual("application/json");
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.statusCode).toEqual(200);
    });
  });
});
