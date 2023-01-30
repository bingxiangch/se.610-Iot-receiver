const index = require("../app");
const request = require("supertest");
const db = require("../tests/mockQueries");

const app = index;

const testUser = {
  username: "test_user",
  password: "12345",
  role: "basic_user",
};

const startDate = "2022-01-01T00:00:00%2B00:00";
const endDate = "2222-01-01T00:00:00%2B00:00";

describe("Data", () => {
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
  });

  describe("POST /data", () => {
    it("should require time format", async () => {
      const devices = await request(app)
        .get("/devices")
        .set("Authorization", `Bearer ${user_access}`);

      const id1 = devices.body.devices[0].device_id;
      const id2 = devices.body.devices[1].device_id;

      await request(app)
        .post(`/data`)
        .set("Authorization", `Bearer ${user_access}`)
        .send({
          deviceList: [id1, id2],
        })
        .expect(400);
    });

    it("should return data from all given devices", async () => {
      const devices = await request(app)
        .get("/devices")
        .set("Authorization", `Bearer ${user_access}`);

      const id1 = devices.body.devices[0].device_id;
      const id2 = devices.body.devices[1].device_id;

      const res = await request(app)
        .post(`/data?timeFormat=minute`)
        .set("Authorization", `Bearer ${user_access}`)
        .send({
          deviceList: [id1, id2],
        });
      expect(res.type).toEqual("application/json");
      expect(res.body.id1).not.toBeNull();
      expect(res.body.id2).not.toBeNull();
      expect(res.statusCode).toEqual(200);
    });
    // TODO - add test for empty device list but needs to limit the dates
    // so test doesn't query all the data at once.
  });

  describe("GET /data/{id}", () => {
    it("should not allow invalid device id", async () => {
      await request(app)
        .get(`/data/notadeviceid?timeFormat=minute`)
        .set("Authorization", `Bearer ${user_access}`)
        .expect(400);
    });

    it("should return 200 if data for id is not found", async () => {
      await request(app)
        .get(`/data/11111111-1111-1111-1111-111111111111?timeFormat=minute`)
        .set("Authorization", `Bearer ${user_access}`)
        .expect(200);
    });

    it("should require time format", async () => {
      const devices = await request(app)
        .get("/devices")
        .set("Authorization", `Bearer ${user_access}`);

      const id = devices.body.devices[0].device_id;

      await request(app)
        .get(`/data/${id}`)
        .set("Authorization", `Bearer ${user_access}`)
        .expect(400);
    });

    it("should return all data from device", async () => {
      const devices = await request(app)
        .get("/devices")
        .set("Authorization", `Bearer ${user_access}`);

      const id = devices.body.devices[0].device_id;

      const res = await request(app)
        .get(`/data/${id}?timeFormat=minute`)
        .set("Authorization", `Bearer ${user_access}`);

      expect(res.type).toEqual("application/json");
      expect(res.body).not.toBeNull();
      expect(res.statusCode).toEqual(200);
    });

    it("should return data from date to now", async () => {
      const devices = await request(app)
        .get("/devices")
        .set("Authorization", `Bearer ${user_access}`);

      const id = devices.body.devices[0].device_id;

      const res = await request(app)
        .get(`/data/${id}?startDate=${startDate}&timeFormat=minute`)
        .set("Authorization", `Bearer ${user_access}`);

      expect(res.type).toEqual("application/json");
      expect(res.body.id).not.toBeNull();
      expect(res.statusCode).toEqual(200);
    });

    it("should return data from now to beginning", async () => {
      const devices = await request(app)
        .get("/devices")
        .set("Authorization", `Bearer ${user_access}`);

      const id = devices.body.devices[0].device_id;

      const res = await request(app)
        .get(`/data/${id}?endDate=${endDate}&timeFormat=minute`)
        .set("Authorization", `Bearer ${user_access}`);

      expect(res.type).toEqual("application/json");
      expect(res.body.id).not.toBeNull();
      expect(res.statusCode).toEqual(200);
    });

    it("should return data between dates", async () => {
      const devices = await request(app)
        .get("/devices")
        .set("Authorization", `Bearer ${user_access}`);

      const id = devices.body.devices[0].device_id;

      const res = await request(app)
        .get(
          `/data/${id}?startDate=${startDate}&endDate=${endDate}&timeFormat=minute`
        )
        .set("Authorization", `Bearer ${user_access}`);

      expect(res.type).toEqual("application/json");
      expect(res.body.id).not.toBeNull();
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("GET /data/monthly/{id}", () => {
    it("should not allow invalid device id", async () => {
      await request(app)
        .get(`/data/monthly/notadeviceid`)
        .set("Authorization", `Bearer ${user_access}`)
        .expect(400);
    });

    it("should return 200 if data for id is not found", async () => {
      await request(app)
        .get(`/data/monthly/11111111-1111-1111-1111-111111111111`)
        .set("Authorization", `Bearer ${user_access}`)
        .expect(200);
    });

    it("should return all data from device", async () => {
      const devices = await request(app)
        .get("/devices")
        .set("Authorization", `Bearer ${user_access}`);

      const id = devices.body.devices[0].device_id;

      const res = await request(app)
        .get(`/data/monthly/${id}`)
        .set("Authorization", `Bearer ${user_access}`);

      expect(res.type).toEqual("application/json");
      expect(res.body).not.toBeNull();
      expect(res.statusCode).toEqual(200);
    });

    it("should return data from date to now", async () => {
      const devices = await request(app)
        .get("/devices")
        .set("Authorization", `Bearer ${user_access}`);

      const id = devices.body.devices[0].device_id;

      const res = await request(app)
        .get(`/data/monthly/${id}?startDate=${startDate}`)
        .set("Authorization", `Bearer ${user_access}`);

      expect(res.type).toEqual("application/json");
      expect(res.body.id).not.toBeNull();
      expect(res.statusCode).toEqual(200);
    });

    it("should return data from now to beginning", async () => {
      const devices = await request(app)
        .get("/devices")
        .set("Authorization", `Bearer ${user_access}`);

      const id = devices.body.devices[0].device_id;

      const res = await request(app)
        .get(`/data/monthly/${id}?endDate=${endDate}`)
        .set("Authorization", `Bearer ${user_access}`);

      expect(res.type).toEqual("application/json");
      expect(res.body.id).not.toBeNull();
      expect(res.statusCode).toEqual(200);
    });

    it("should return data between dates", async () => {
      const devices = await request(app)
        .get("/devices")
        .set("Authorization", `Bearer ${user_access}`);

      const id = devices.body.devices[0].device_id;

      const res = await request(app)
        .get(`/data/monthly/${id}?startDate=${startDate}&endDate=${endDate}`)
        .set("Authorization", `Bearer ${user_access}`);

      expect(res.type).toEqual("application/json");
      expect(res.body.id).not.toBeNull();
      expect(res.statusCode).toEqual(200);
    });
  });
});
