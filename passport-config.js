const LocalStrategy = require("passport-local").Strategy;
const pool = require("./db.js");
const bcrypt = require("bcrypt");


pool.on('error', (err, client) => {
  console.error('Errorsdfsdf: ', err)
  process.exit(-1)
})

function initialize(passport) {
  const authenticateUser = (email, password, done) => {
    pool.query(
      `SELECT * FROM usuario WHERE n_usuario = $1`,
      [email],
      (err, results) => {
        if (err) {
          throw err;
        }

        if (results.rows.length > 0) {
          const user = results.rows[0];

          bcrypt.compare(password, user.pass, (err, isMatch) => {
            if (err) {
              console.log(err);
            }
            if (isMatch) {
              return done(null, user);
            } else {
              //password is incorrect
              return done(null, false, { message: "Password is incorrect" });
            }
          });
        } else {
          // No user
          return done(null, false, {
            message: "No user with that email address"
          });
        }
      }
    );
  };
  passport.serializeUser((user, done) => done(null, user.uid));

  passport.deserializeUser((id, done) => {
    pool.query(`SELECT * FROM usuario WHERE uid = $1`, [id], (err, results) => {
      if (err) {
        return done(err);
      }
      console.log(`ID is ${results.rows[0].uid}`);
      return done(null, results.rows[0]);
    });
  });

  passport.use(
    new LocalStrategy(
      { usernameField: 'nUsuario', passwordField: 'pass' },
      authenticateUser
    )
  );
}

module.exports = initialize;