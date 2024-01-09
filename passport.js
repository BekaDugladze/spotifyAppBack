const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const SpotifyStrategy = require('passport-spotify').Strategy;

passport.use(
  new SpotifyStrategy(
    {
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      callbackURL: 'https://spotify-back-vsee.onrender.com/spotify/callback'
    },
    function(accessToken, refreshToken, expires_in, profile, done) {
        return done(null, profile);
    }
  )
);

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://spotify-back-vsee.onrender.com/google/callback",
    passReqToCallback: true,
  },
  function(request, accessToken, refreshToken, profile, done) {
      return done(null, profile);
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "https://spotify-back-vsee.onrender.com/facebook/callback",
    passReqToCallback: true,
  },
  function(req, accessToken, refreshToken, profile, done) {
      return done(null, profile);
  }
));


  passport.serializeUser((user, done) => {
    done(null, user);
  })
  
  passport.deserializeUser((user, done) => {
    done(null, user);
  })

  
function isLoggedIn(req, res, next) {
    req.user ? next() : res.status(401);
}
