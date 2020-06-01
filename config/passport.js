const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user');
const bcrypt = require('bcryptjs');


module.exports = function (passport) {

    passport.use(new LocalStrategy(
        function (username, password, done) {
            User.findOne({
                username: username
            }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {
                        message: 'Unknown user!'
                    });
                }

                bcrypt.compare(password, user.password, function (err, isMatch) {
                    // res === true
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, {
                            message: 'Invalid password!'
                        });
                    }
                });
            });
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });


}
