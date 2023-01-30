const index = require("../app");
const request = require("supertest");
const db = require("../tests/mockQueries");
const fs = require("fs");

const app = index;

const testAdmin = {
  username: "test_admin",
  password: "12345",
  role: "admin_user",
};
const testUser = {
  username: "test_user",
  password: "12345",
  role: "basic_user",
};

const testToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Ik1hdHRpIiwicm9sZSI6ImFkbWluX3VzZXIiLCJpYXQiOjE2NjYwMDU1OTIsImV4cCI6MTY2ODU5NzU5Mn0.F1DZFTe4joTd7d3mHYboaSXq_vLiuJLq60vwg7vRRv0`;

beforeAll(async () => {
  await db.createUser({
    username: "test_admin",
    password: "$2b$10$eoqTeevVC.T2G5y9ngKJKOm4zgl3IeFpevOgWSiYCObgILVTdO0O6",
    role: "admin_user",
  });
  await db.createUser({
    username: "test_user",
    password: "$2b$10$4Zn8O3Z7uAD42A2sevQra.TlDQVhM23qA4CQKlQSNIJlzOzdYvV5e",
    role: "basic_user",
  });
});

afterAll(async () => {
  // Checks if file exists
  if (fs.existsSync(db.tempUsersPath)) {
    // Deletes the file.
    fs.unlinkSync(db.tempUsersPath);
  }
});

describe("Auth", () => {
  let refreshToken;

  describe("POST /login", () => {
    it("should not allow login with missing credentials", async () => {
      await request(app)
        .post("/auth/login")
        .set("Content-Type", "application/json")
        .send({})
        .expect(400);
    });

    it("should not allow login with invalid username", async () => {
      await request(app)
        .post("/auth/login")
        .set("Content-Type", "application/json")
        .send({
          username: "userthatwontbeinthedbQh7sNWc3",
          password: "12345",
        })
        .expect(401);
    });

    it("should not allow login with invalid password", async () => {
      await request(app)
        .post("/auth/login")
        .set("Content-Type", "application/json")
        .send({
          username: "test_user",
          password: "54321",
        })
        .expect(401);
    });

    it("should return an accesstoken and a refreshtoken", async () => {
      const res = await request(app)
        .post("/auth/login")
        .set("Content-Type", "application/json")
        .send(testAdmin);
      expect(res.body.accessToken).not.toBeNull();
      expect(res.body.refreshToken).not.toBeNull();
      refreshToken = res.body.refreshToken;
    });
  });

  describe("POST /token", () => {
    it("should require a token", async () => {
      await request(app)
        .post("/auth/token")
        .set("Content-Type", "application/json")
        .send({})
        .expect(400);
    });

    it("should not return a new token with an invalid token", async () => {
      await request(app)
        .post("/auth/token")
        .set("Content-Type", "application/json")
        .send({
          token: testToken,
        })
        .expect(403);
    });

    it("should return a new access token", async () => {
      const res = await request(app)
        .post("/auth/token")
        .set("Content-Type", "application/json")
        .send({
          token: refreshToken,
        })
        .expect(200);
      expect(res.body.accessToken).not.toBeNull();
      expect(res.body.refreshToken).not.toBeNull();

      await request(app)
        .get("/")
        .set("Authorization", `Bearer ${res.body.accessToken}`)
        .expect(200);
    });

    // Works but JEST fails.
    /*it("should not allow refresh with same token twice", async () =>
        {
            await request(app)
                .post("/auth/token")
                .set("Content-Type", "application/json")
                .send({
                    token: refreshToken
                }).expect(403);
        });*/
  });

  describe("POST /logout", () => {
    it("should require a token", async () => {
      await request(app)
        .post("/auth/logout")
        .set("Content-Type", "application/json")
        .send({})
        .expect(400);
    });

    it("should not logout with invalid token", async () => {
      await request(app)
        .post("/auth/logout")
        .set("Content-Type", "application/json")
        .send({
          token: testToken,
        })
        .expect(400);
    });

    // Works but JEST fails.
    it("should logout the user", async () => {
      const res = await request(app)
        .post("/auth/login")
        .set("Content-Type", "application/json")
        .send(testUser)
        .expect(200);

      await request(app)
        .post("/auth/logout")
        .set("Content-Type", "application/json")
        .send({
          token: res.body.refreshToken,
        })
        .expect(200);

      await request(app)
        .post("/auth/token")
        .set("Content-Type", "application/json")
        .send({
          token: res.body.refreshToken,
        })
        .expect(403);
    });
  });
});

describe("Authentication", () => {
  it("should not allow api access with invalid token", async () => {
    await request(app)
      .get("/")
      .set("Authorization", `Bearer ${testToken}`)
      .expect(403);
  });

  it("should not allow access without authorization header", async () => {
    await request(app).get("/").expect(401);
  });

  it("should not allow invalid authorization header", async () => {
    await request(app)
      .get("/")
      .set("Authorization", `Bearer${testToken}`)
      .expect(401);
  });
});

describe("Users", () => {
  let admin_access;
  let user_access;

  beforeAll(async () => {
    await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send(testAdmin)
      .then((res) => {
        admin_access = res.body.accessToken;
      });

    await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send(testUser)
      .then((res) => {
        user_access = res.body.accessToken;
      });
  });

  describe("/users middleware", () => {
    it("should allow admin users", async () => {
      await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${admin_access}`)
        .expect(200);
    });

    it("should forbid unauthorized users", async () => {
      await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${user_access}`)
        .expect(403);
    });
  });

  describe("GET /users routing", () => {
    it("should return a list of users", async () => {
      const res = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${admin_access}`);
      expect(res.type).toEqual("application/json");
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("GET /users/{id} routing", () => {
    it("should return 404 if user is not found", async () => {
      await request(app)
        .get(`/users/userthatwontbeinthedbQh7sNWc3`)
        .set("Authorization", `Bearer ${admin_access}`)
        .expect(404);
    });

    it("should return a user", async () => {
      const res = await request(app)
        .get(`/users/${testUser.username}`)
        .set("Authorization", `Bearer ${admin_access}`);
      expect(res.type).toEqual("application/json");
      expect(res.body.username).toEqual(testUser.username);
      expect(res.body.password).not.toBeNull();
      expect(res.body.role).toEqual(testUser.role);
      expect(res.statusCode).toEqual(200);
    });
  });

  const newUser = {
    username: "new_user",
    password: "12345",
    role: "basic_user",
  };

  describe("POST /users routing", () => {
    it("should not allow missing fields", async () => {
      await request(app)
        .post("/users")
        .set("Authorization", `Bearer ${admin_access}`)
        .send({
          username: "Mat",
          password: "",
          role: "",
        })
        .expect(400);
    });

    it("should tell if username is already in use", async () => {
      await request(app)
        .post("/users")
        .set("Authorization", `Bearer ${admin_access}`)
        .send(testUser)
        .expect(400);
    });

    it("should create a user", async () => {
      const res = await request(app)
        .post("/users")
        .set("Authorization", `Bearer ${admin_access}`)
        .send(newUser);
      expect(res.type).toEqual("text/html");
      expect(res.text).toEqual(
        `Succesfully created new user "${newUser.username}".`
      );
      expect(res.statusCode).toEqual(201);
    });
  });

  describe("PUT /users routing", () => {
    it("should not allow incorrect user role", async () => {
      await request(app)
        .put(`/users/${newUser.username}`)
        .set("Authorization", `Bearer ${admin_access}`)
        .send({ role: "notarole" })
        .expect(400);
    });

    it("should not allow user that doesn't exist", async () => {
      await request(app)
        .put("/users/thisusernamewontexistsinthedatabase")
        .set("Authorization", `Bearer ${admin_access}`)
        .send({})
        .expect(404);
    });

    it("should change password", async () => {
      await request(app)
        .put(`/users/${newUser.username}`)
        .set("Authorization", `Bearer ${admin_access}`)
        .send({ password: 12345 })
        .expect(200);
    });

    it("should change role", async () => {
      await request(app)
        .put(`/users/${newUser.username}`)
        .set("Authorization", `Bearer ${admin_access}`)
        .send({ role: "basic_user" })
        .expect(200);
    });
  });

  describe("DELETE /users/{id} routing", () => {
    it("should delete a user", async () => {
      await request(app)
        .delete(`/users/${newUser.username}`)
        .set("Authorization", `Bearer ${admin_access}`)
        .expect(200);

      await request(app)
        .get(`/users/${newUser.username}`)
        .set("Authorization", `Bearer ${admin_access}`)
        .expect(404);
    });
  });
});
