const express = require("express");
const { body, param, validationResult } = require("express-validator");
const { hash } = require("bcrypt");
const db =
  process.env.JEST_WORKER_ID !== undefined
    ? require("../tests/mockQueries")
    : require("../db/queries");

const router = express.Router();

/**
 * Check if given value is a valid user-role.
 * @param {string} value
 * @returns {boolean}
 */
const isUserRole = (value) => {
  if (value === "admin_user" || value === "basic_user") {
    return true;
  }
  return false;
};

// Check if user is admin.
router.use((req, res, next) => {
  // Authorization.
  if (req.user.role !== "admin_user") return res.sendStatus(403);
  next();
});

router.get("/", async (req, res) => {
  const users = await db.getUsers();
  if (!users) {
    return res.sendStatus(404);
  }
  return res.json(users);
});

router.post(
  "/",
  body("username").notEmpty().trim().escape(),
  body("password").notEmpty().trim().escape(),
  body("role").custom(isUserRole).notEmpty().trim().escape(),
  async (req, res) => {
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ errors: validationResult(req).array() });

    // Create hashed from the password.
    const hashed = await hash(req.body.password, 11);
    if (!hashed) return res.status(401).send("Password generation failed.");

    // Create new user object and send it to the database.
    const newUser = {
      username: req.body.username,
      password: req.body.password,
      role: req.body.role,
    };
    newUser.password = hashed;

    const result = await db.createUser(newUser);

    if (!result) return res.status(400).send("User creation failed.");

    return res
      .status(201)
      .send(`Succesfully created new user "${newUser["username"]}".`);
  }
);

router.get(
  "/:username",
  param("username").exists().trim().escape(),
  async (req, res) => {
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ errors: validationResult(req).array() });

    const user = await db.getUserByUserName({
      username: req.params["username"],
    });
    if (!user || user.length === 0 || !user[0])
      return res.status(404).send("User not found.");

    delete user[0].password;
    delete user[0].token;

    return res.json(user[0]);
  }
);

router.put(
  "/:username",
  param("username").exists().trim().escape(),
  body("username").trim().escape(),
  body("password").trim().escape(),
  body("role")
    .custom((v) => {
      return !v ? true : isUserRole(v);
    })
    .trim()
    .escape(),
  async (req, res) => {
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ errors: validationResult(req).array() });
    // Find existing user.
    const user = await db.getUserByUserName({
      username: req.params["username"],
    });
    if (!user || user.length === 0 || !user[0])
      return res.status(404).send("User not found.");

    // Create new user object and send it to the database.
    const newUser = { ...user[0] };

    delete newUser.token;

    if (req.body.username) newUser.username = req.body.username;
    if (req.body.password) {
      // Create hashed from the password.
      const hashed = await hash(req.body.password, 11);
      if (!hashed) return res.status(401).send("Password generation failed.");
      newUser.password = hashed;
    }
    if (req.body.role) newUser.role = req.body.role;
    const result = await db.editUser(newUser);
    if (!result)
      return res
        .status(400)
        .send(`Updating user "${req.params.username}" failed.`);

    return res.send(`Updated user "${req.params.username}".`);
  }
);

router.delete(
  "/:username",
  param("username").exists().trim().escape(),
  async (req, res) => {
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ errors: validationResult(req).array() });

    const result = await db.deleteUser({ username: req.params["username"] });

    if (!result)
      return res
        .status(400)
        .send(`Deleting user "${req.params["username"]}" failed.`);

    return res.send(`Succesfully deleted user "${req.params["username"]}"`);
  }
);

module.exports = router;
