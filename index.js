const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const passport = require('passport');
const cookieSession = require('cookie-session');
require('./passport');
const session = require('express-session');
const axios = require('axios');
const http = require('http');

app.use(session({
    secret: '231322', 
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 3600 * 24 * 24 * 1,
    },
  }));
app.use(passport.initialize());
app.use(passport.session());

app.use(
    cors({
        origin: 'https://spotify-app-front-zeta.vercel.app',
        methods: 'GET, POST, PUT, DELETE',
        credentials: 'include,
    })
)


app.get('/', function(req, res) {
    res.send('<a href="/auth/google">google</a> <a href="/auth/facebook">facebook</a> <a href="/auth/spotify">spotify</a>');
})

//Google

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/google/callback', passport.authenticate('google', {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: '/login/failure'
}
))

//Facebook

app.get('/auth/facebook',
passport.authenticate('facebook')
);

app.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect(process.env.CLIENT_URL);
  });


//Spotify
app.get(
  '/auth/spotify',
  passport.authenticate('spotify', {
    scope: ['user-read-email', 'user-read-private']
  })
);

app.get(
  '/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/login/failure' }),
  function(req, res) {
    res.redirect(process.env.CLIENT_URL);
  }
);

app.get('/profile',  (req, res) => {
    if (req.user) {
        res.status(200).json({
            message: ` ${req.user.displayName}`
        })
        console.log(req.user)
    } else {
        res.status(500)
    }
});


app.get('/login/failure', (req, res) => {
    res.status(401).json({
        error: true,
        message: 'login failed'
    })
}
)

app.get('/logout', (req, res) => {
    req.session.destroy(); // Destroy the session
    res.redirect('/')
})


const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

app.get('/songs', async (req, res) => {
  try {
    const query = req.query.query;
    console.log('Received query:', query);

    const accessToken = await getAccessToken();
    const searchResult = await searchSpotify(query , accessToken);

    // Return the results as JSON
    res.status(200).json(searchResult);
    
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

async function getAccessToken() {
  const response = await axios.post('https://accounts.spotify.com/api/token', null, {
    params: {
      grant_type: 'client_credentials',
    },
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
  });

  return response.data.access_token;
}

async function searchSpotify(query, accessToken) {
  const response = await axios.get('https://api.spotify.com/v1/search', {
    params: {
      q: query,
      type: 'track', // You can change this to 'artist' or 'album'
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}
async function searchSpot(query, accessToken) {
  const response = await axios.get('https://api.spotify.com/v1/search', {
  params: {
    q: query,
    type: 'artist',
    limit: 10, // Adjust the number as needed
  },
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
  });
  return response.data
}


app.get('/artists', async (req, res) => {
  try {
    const query = req.query.query;
    console.log('Received query:', query);

    const accessToken = await getAccessToken();
    const searchResult = await searchSpot(query, accessToken);

// Extract relevant data, assuming it follows the structure of the Spotify API response
    console.log('Spotify API Response:', searchResult);

    const artists = searchResult.artists.items;
    res.json({ artists });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});


function getRandomLetter() {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const randomIndex = Math.floor(Math.random() * letters.length);
  return letters[randomIndex];
}

//albuu
app.get('/random', async (req, res) => {
  try {
    const random = getRandomLetter();
    const accessToken = await getAccessToken();
    const searchResult = await searchSpotify(random , accessToken);

    // Return the results as JSON
    res.status(200).json(searchResult);
    
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
})

app.get('/artists/random', async (req, res) => {
  try {
    const random = getRandomLetter();

    const accessToken = await getAccessToken();
    const searchResult = await searchSpot(random, accessToken);

// Extract relevant data, assuming it follows the structure of the Spotify API response
    console.log('Spotify API Response:', searchResult);

    const artists = searchResult.artists.items;
    res.json({ artists });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json'});
  res.end('Hello, world!');
})

const port = process.env.PORT || 8090;
app.listen(port, () => console.log('Listening on port ' + port));
