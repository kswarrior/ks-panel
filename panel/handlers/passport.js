const { Authenticator } = require('@fastify/passport');
const passport = new Authenticator();
const { db } = require('./db');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const settings = (await db.get("settings")) || {};
      const users = await db.get("users");
      if (!users) {
        return done(null, false, { message: "No users found." });
      }

      const isEmail = username.includes("@");

      let user;
      if (isEmail) {
        user = users.find((user) => user.email === username);
      } else {
        user = users.find((user) => user.username === username);
      }

      if (!user) {
        return done(null, false, { message: "Incorrect username or email." });
      }

      if (!user.verified && (settings.emailVerification || false)) {
        return done(null, false, {
          message: "Email not verified. Please verify your email.",
          userNotVerified: true,
        });
      }

      const match = await bcrypt.compare(password, user.password);
      if (match) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Incorrect password." });
      }
    } catch (error) {
      return done(error);
    }
  })
);

passport.registerUserSerializer(async (user, request) => {
  return user.username;
});

passport.registerUserDeserializer(async (username, request) => {
  try {
    const users = await db.get("users");
    if (!users) return null;
    return users.find((user) => user.username === username) || null;
  } catch (error) {
    return null;
  }
});

module.exports = passport;
