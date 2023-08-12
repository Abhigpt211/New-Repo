const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const connectToDb = require('./db.config.js')
require ('dotenv').config()


const app = express();
const port = process.env.PORT || 3680


// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json())
 
app.use(express.static('public'))

connectToDb()





app.use(cors({
  origin: ['http://127.0.0.1:5500/Client/?'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,  // Enable credentials (cookies, authorization headers, etc.)
}));



const movieSchema = new mongoose.Schema({
    imdbID: String,
    Title: String,
});

const Movie = mongoose.model('Movie', movieSchema);

const playlistSchema = new mongoose.Schema({
    playlistName: String,
    movies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
    }]
});

const Playlist = mongoose.model('Playlist', playlistSchema);

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    }
  });
  
  // Create the User model
  const User = mongoose.model('User', userSchema);

  app.post('/api/register', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Check if the username is already taken
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      } 
  
      if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }
      // Create a new user
      const newUser = new User({ username, password });
      await newUser.save();
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Error during user registration:', error);
      res.status(500).json({ message: 'An error occurred during registration' });
    } 
  })
  
  
app.post('/api/login', async (req, res) => {
  try {
      const { username, password } = req.body;

      // Check if the user exists
      const user = await User.findOne({ username });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Check if the provided password matches the stored password (not hashed)
      if (user.password !== password) {
          return res.status(401).json({ message: 'Invalid password' });
      }

      // Successfully authenticated
      res.status(200).json({ message: 'Login successful' });

  } catch (error) {
      console.error('Error during user login:', error);
      res.status(500).json({ message: 'An error occurred during login' });
  }
});


// POST request to add a movie to a playlist
app.post('/api/addToPlaylist', async (req, res) => {
  try {
      const { imdbID, playlistType, playlistName, username, password } = req.body;

      // Check if the user exists based on username
      const user = await User.findOne({ username });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Validate the user's password
      if (!user.validatePassword(password)) {
          return res.status(401).json({ message: 'Invalid password' });
      }

      // Find the playlist based on the type and name
      const playlist = await Playlist.findOne({ type: playlistType, name: playlistName });

      if (!playlist) {
          return res.status(404).json({ message: 'Playlist not found' });
      }

      // Add the movie to the playlist
      playlist.movies.push({ imdbID });

      // Save the updated playlist
      await playlist.save();

      res.status(200).json({ message: 'Movie added to the playlist successfully' });
  } catch (error) {
      console.error('Error during adding movie to playlist:', error);
      res.status(500).json({ message: 'An error occurred while adding movie to playlist' });
  }
});
  





app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});