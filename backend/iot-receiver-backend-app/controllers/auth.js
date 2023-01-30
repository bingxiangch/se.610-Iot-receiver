const jwt = require("jsonwebtoken");
const express = require("express");
const { body, validationResult } = require("express-validator");
const { compare } = require("bcrypt");
const db =
  process.env.JEST_WORKER_ID !== undefined
    ? require("../tests/mockQueries")
    : require("../db/queries");

const router = express.Router();

let refreshTokens = [];

router.post(
  "/login",
  body("username").notEmpty().trim().escape(),
  body("password").notEmpty().trim().escape(),
  async (req, res) => {
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ errors: validationResult(req).array() });
    const user = await db.getUserByUserName({ username: req.body.username });
    if (!user || user.length === 0)
      return res.status(401).send("Incorrect username or password.");

    // Check password.
    const result = await compare(req.body.password, user[0].password);
    if (!result) return res.status(401).send("Incorrect username or password.");
    const tokens = generateTokens({
      username: user[0].username,
      role: user[0].role,
    });
    await db.editUser({
      id: user[0].id,
      token: tokens.refreshToken,
    });
    // Add refresh token to list
    refreshTokens.push(tokens.refreshToken);
    res.json(tokens);
  }
);

router.post(
  "/logout",
  body("token").notEmpty().trim().escape(),
  async (req, res) => {
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ errors: validationResult(req).array() });

    // Parse token from body.
    const token = req.body.token;

    const decoded = jwt.decode(token, process.env.REFRESH_TOKEN);
    const user = (
      await db.getUserByUserName({ username: decoded.username })
    )[0];

    if (user && user.token === req.body.token) {
      await db.editUser({ id: user.id });
      return res.send("Logout successful");
    }

    return res.status(400).send("Logout Failed");
  }
);

router.post("/token", body("token").notEmpty().escape(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const token = req.body.token;

  // Check the token in the request body.
  jwt.verify(token, process.env.REFRESH_TOKEN, async (err, userJSON) => {
    if (err) return res.status(403).send(err);

    req.user = userJSON;

    // Check if the user in database has the same token.
    const user = (
      await db.getUserByUserName({ username: userJSON.username })
    )[0];
    if (!user || user.token !== token)
      return res.status(403).send("Invalid token");

    const tokens = generateTokens({
      username: userJSON.username,
      role: userJSON.role,
    });

    await db.editUser({
      id: user.id,
      token: tokens.refreshToken,
    });

    return res.json(tokens);
  });
});

/**
 * Generates two token on login. An Access and a refresh token.
 * @param {json} payload to be included in jwt.
 * @param {string} expiration time after which token will expire.
 * Given as string in this format - https://github.com/vercel/ms.
 * @returns {json} { accessToken, refreshToken }
 */
const generateTokens = (payload) => {
  return {
    accessToken: jwt.sign(payload, process.env.TOKEN, {
      expiresIn: process.env.ACCESS_EXPIRE,
    }),
    refreshToken: jwt.sign(payload, process.env.REFRESH_TOKEN, {
      expiresIn: process.env.REFRESH_EXPIRE,
    }),
    accessTokenExpires: process.env.ACCESS_EXPIRE,
    refreshTokenExpires: process.env.REFRESH_EXPIRE,
  };
};

/**
 * Checks if token given in authorization header is valid.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns either response or passes to next function.
 */
const authenticateToken = (req, res, next) => {
  // Check for authorization header
  if (!("authorization" in req.headers)) return res.sendStatus(401);
  const authHeader = req.headers["authorization"];
  // Parse and check for token.
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN, (err, user) => {
    if (err) return res.status(403).send(err);
    req.user = user;
    next();
  });
};

module.exports = { router, authenticateToken };
