document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    const movieTitleInput = document.getElementById('movieTitle');
    
    const registerButton = document.getElementById('registerButton');
    const loginButton = document.getElementById('loginButton');
    
    const playlistContainer = document.getElementById('playlistContainer');
    
    searchButton.addEventListener('click', searchMovies);
    registerButton.addEventListener('click', registerUser);
    loginButton.addEventListener('click', loginUser);
    
    function searchMovies() {
        const movieTitle = movieTitleInput.value;
        const apiKey = 'fdb300f4'; // Replace with your actual OMDB API key
        
        // Construct the API URL
        const apiUrl = `https://www.omdbapi.com/?s=${movieTitle}&apikey=${apiKey}`;
        
        // Clear previous search results
        searchResults.innerHTML = '';
        
        // Make the API request
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.Search) {
                    displaySearchResults(data.Search);
                } else {
                    searchResults.innerHTML = '<p>No results found.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                searchResults.innerHTML = '<p>An error occurred. Please try again later.</p>';
            });
    }
    
    function displaySearchResults(results) {
        searchResults.innerHTML = '';
        results.forEach(movie => {
            const movieItem = document.createElement('div');
            movieItem.classList.add('movie-item');
            movieItem.innerHTML = `
                <img src="${movie.Poster}" alt="${movie.Title} ">
                <h3>${movie.Title}</h3>
                <p>Year: ${movie.Year}</p>
                <button class="add-to-playlist" data-imdbid="${movie.imdbID}">Add to Playlist</button>
            `;
            searchResults.appendChild(movieItem);
        });
    
        // Attach event listeners to the "Add to Playlist" buttons
        const addToPlaylistButtons = document.querySelectorAll('.add-to-playlist');
        addToPlaylistButtons.forEach(button => {
            button.addEventListener('click', addToPlaylist);
        });
    }

function addToPlaylist(event) {
    if (isUserLoggedIn()) {
        const imdbID = event.target.getAttribute('data-imdbid');
        const playlistDialog = document.getElementById('playlistDialog');
        const playlistTypeInput = document.getElementById('playlistType');
        const playlistNameInput = document.getElementById('playlistName');
        const confirmButton = document.getElementById('confirmPlaylist');

        // Show the custom dialog box
        playlistDialog.style.display = 'block';

        // Handle the Confirm button click
        confirmButton.addEventListener('click', () => {
            const playlistType = playlistTypeInput.value.toLowerCase();
            const playlistName = playlistNameInput.value;

            // Check if the entered playlist type is valid
            if (playlistType === 'public' || playlistType === 'private') {
                // Add the movie to the selected playlist type
                addMovieToPlaylist(imdbID, playlistType, playlistName);
                // Hide the dialog box
                playlistDialog.style.display = 'none';
                // Refresh the playlist display
                displayPlaylist();
            } else {
                alert("Invalid playlist type. Please choose 'public' or 'private'.");
            }
        });
    }
}

    let isLoggedIn = true
   
    function addMovieToPlaylist(imdbID, playlistType,playlistName) {
        const selectedPlaylist = playlists[playlistType];
        if (selectedPlaylist) {
            const playlistId = generatePlaylistId();
            selectedPlaylist.push({imdbID, playlistName, playlistId});
            console.log(`Added movie ${imdbID} to  ${playlistType} playlist with name "${playlistName}.`);
        }
    }
   


function isUserLoggedIn() {
    if(isLoggedIn !== true){
        alert("Please Create Account before adding movie to playlist"); 
    }
    return isLoggedIn; // Return the simulated authentication state
}

    function generatePlaylistId() {
        const length = 10; // Adjust the length of the generated ID if needed
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let playlistId = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            playlistId += characters.charAt(randomIndex);
        }
        return playlistId;
    }
    
    async function registerUser() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
    
        // Construct the registration data
        const registrationData = {
            username: username,
            password: password
        };
    
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log(data.message); // Registration success message
            } else {
                const errorData = await response.json();
                console.error('Registration error:', errorData.message);
            }
        } catch (error) {
            console.error('An error occurred during registration:', error);
        }
    }

    document.getElementById('registrationForm').addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
        await registerUser();
    });


    function loginUser() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
    
        // Construct the login data
        const loginData = {
            username: username,
            password: password
        };
    
        // Make an API request to log in the user
        fetch('https://your-backend-server/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Login successful, store the user's authentication token or session
                // You might redirect the user or update UI to reflect their logged-in status
                alert('Login successful!');
            } else {
                // Login failed, provide error message to the user
                alert('Login failed. Please check your credentials and try again.');
            }
        })
        .catch(error => {
            console.error('Error logging in user:', error);
            alert('An error occurred. Please try again later.');
        });
    }
    
    function displayPlaylist() {
        const playlistContainer = document.getElementById('playlistContainer');
        playlistContainer.innerHTML = ''; // Clear the container
    
        for (const playlistType in playlists) {
            if (playlists.hasOwnProperty(playlistType)) {
                const playlistHeading = document.createElement('h3');
                playlistHeading.textContent = `${playlistType} Playlist`;
    
                const playlistList = document.createElement('ul');
                playlists[playlistType].forEach(movie => {
                    const listItem = document.createElement('li');
                    const shareableLink = document.createElement('a');
                    shareableLink.href = `share.html?playlist=${movie.playlistId}`;
                    shareableLink.textContent = 'Share'
                    listItem.textContent = `Movie: ${movie.Title}, Playlist: ${movie.playlistName}`;
                    listItem.appendChild(shareableLink);
                    playlistList.appendChild(listItem);
                });
    
                playlistContainer.appendChild(playlistHeading);
                playlistContainer.appendChild(playlistList);
            }
        }
        document.querySelectorAll('.edit-button').forEach(editButton => {
            editButton.addEventListener('click', editPlaylistName);
        });
    
        document.querySelectorAll('.delete-button').forEach(deleteButton => {
            deleteButton.addEventListener('click', deletePlaylist);
        });
        
    }

    const playlists = {
        public: [],
        private: []
    };

   
    
    // Display initial playlists and movies
    displayPlaylist();
    
    
});