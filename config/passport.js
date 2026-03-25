const passport = require("passport");
const User = require("../models/user");
const LocalStrategy = require("passport-local").Strategy;
const { validationResult } = require("express-validator");

const ERRORS_MESSAGES = {
  email: "Email is invalid",
  password: "Password should be 4 symbols min",
};

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  "local.signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async function signUp(req, email, password, done) {
      const { errors } = validationResult(req);

      if (errors.length) {
        const messages = [];

        errors.forEach(function (error) {
          messages.push(ERRORS_MESSAGES[error.param]);
        });

        return done(null, false, req.flash("error", messages));
      }
      try {
        const user = await User.findOne({ email: email });
        if (user) {
          return done(null, false, { message: "Email is already in use." });
        }

        const newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);

        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.use(
  "local.signin",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async function signIn(req, email, password, done) {
      const { errors } = validationResult(req);

      if (errors.length) {
        const messages = [];

        errors.forEach(function (error) {
          console.log(ERRORS_MESSAGES[error.param]);
          messages.push(ERRORS_MESSAGES[error.param]);
        });

        return done(null, false, req.flash("error", messages));
      }

      try {
        const user = await User.findOne({ email: email });
        const message = { message: "Wrong email or password" };

        if (!user) {
          return done(null, false, message);
        }

        if (!user.validPassword(password)) {
          return done(null, false, message);
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);
