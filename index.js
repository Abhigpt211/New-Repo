const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3560


// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json())
 
app.use(express.static('public'))




// app.use(cors({
//   origin: ['http://127.0.0.1:5500/Client/?'],
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true,  // Enable credentials (cookies, authorization headers, etc.)
// }));


mongoose.connect( process.env.MONGODB_URL || 'mongodb://localhost:27017/moviePlaylistDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
console.log('DB Connected')


const movieSchema = new mongoose.Schema({
    imdbID: String,
    Title: String
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
  });




app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});