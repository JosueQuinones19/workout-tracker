const GoogleStrategy = require('passport-google-oauth20').Strategy;
const connectDB = require('../db');

module.exports = function (passport) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const db = await connectDB();
      const users = db.collection('users');

      let user = await users.findOne({ googleId: profile.id });

      if (!user) {
        const newUser = {
          googleId: profile.id,
          firstName: profile.name.givenName || '',
          lastName: profile.name.familyName || '',
          email: profile.emails[0].value,
          profilePicture: profile.photos[0].value,
          role: 'user',
          createdAt: new Date()
        };
        const result = await users.insertOne(newUser);
        user = { _id: result.insertedId, ...newUser };
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const db = await connectDB();
      const { ObjectId } = require('mongodb');
      const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};