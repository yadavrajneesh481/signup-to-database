# Node.js + Express + MongoDB Form Submission Project

## Overview
This project is a full-stack web application that allows users to submit a contact form. The submitted data is saved to a MongoDB database. The project uses Node.js, Express, and Mongoose on the backend, and a simple HTML/CSS/JS frontend.

**Features:**
- User-friendly contact form (Name, Email, Age, Message)
- Form data is sent to a Node.js/Express backend
- Data is validated and saved to MongoDB using Mongoose
- Users can view all submissions at `/users`
- Responsive, modern UI

---

## Project Structure
```
FORM SUMBIT/
├── node_modules/           # npm dependencies
├── package.json            # Project metadata and dependencies
├── package-lock.json       # npm lockfile
├── server.js               # Main Node.js backend server
├── public/
│   ├── index.html          # Frontend HTML form
│   └── script.js           # Frontend JavaScript for form handling
```

---

## How It Works

### 1. Frontend (`public/index.html` & `public/script.js`)
- **index.html**: Contains the HTML structure and CSS for the contact form. Users enter their name, email, age, and a message.
- **script.js**: Handles form submission with JavaScript. When the user submits the form:
  - The default browser submission is prevented.
  - The form data is collected and sent as a JSON POST request to `/submit-form`.
  - Displays success/error messages based on the server response.

### 2. Backend (`server.js`)
- **Express** serves static files and handles API routes.
- **Mongoose** connects to MongoDB and defines a schema for form data.
- **Routes:**
  - `GET /` — Serves the HTML form.
  - `POST /submit-form` — Accepts form submissions, validates and saves to MongoDB.
  - `GET /users` — Returns all submitted forms as JSON.
- **Graceful shutdown:** Closes MongoDB connection on server stop.

---

## Detailed Explanation of Each File

### `server.js`
Below is an explanation of **every line** in `server.js`:

```js
// server.js - This is our main server file
// Import required modules
const express = require('express'); // Express framework for creating web server
const mongoose = require('mongoose'); // Mongoose for MongoDB database operations
const path = require('path'); // Path module for handling file paths

// Create an Express application
const app = express();

// Set the port number (use environment variable or default to 3000)
const PORT = process.env.PORT || 3000;

// MongoDB connection string (replace with your actual MongoDB URL)
const MONGODB_URI = 'mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.vutzzt4.mongodb.net/'; // Local MongoDB
// For MongoDB Atlas (cloud), use: 'mongodb+srv://username:password@cluster.mongodb.net/formapp'

// Middleware setup
app.use(express.json()); // Parse JSON bodies (for API requests)
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (for form submissions)
app.use(express.static('public')); // Serve static files from 'public' directory

// Connect to MongoDB database
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

// Define a schema for our form data
const userSchema = new mongoose.Schema({
  name: {
    type: String,      // Data type is string
    required: true,    // This field is mandatory
    trim: true         // Remove whitespace from beginning and end
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true    // Convert to lowercase
  },
  age: {
    type: Number,      // Data type is number
    required: true,
    min: 1,            // Minimum value is 1
    max: 120           // Maximum value is 120
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now  // Automatically set current date/time
  }
});

// Create a model from the schema
const User = mongoose.model('User', userSchema);

// Routes (URL endpoints)

// GET route - Serve the HTML form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST route - Handle form submission
app.post('/submit-form', async (req, res) => {
  try {
    const { name, email, age, message } = req.body; // Extract form data
    const newUser = new User({
      name: name,
      email: email,
      age: parseInt(age), // Convert age to number
      message: message
    });
    const savedUser = await newUser.save(); // Save to DB
    console.log('✅ User data saved:', savedUser); // Log success
    res.json({
      success: true,
      message: 'Form submitted successfully!',
      data: savedUser
    });
  } catch (error) {
    console.error('❌ Error saving user data:', error); // Log error
    res.status(400).json({
      success: false,
      message: 'Error submitting form',
      error: error.message
    });
  }
});

// GET route - View all submitted forms
app.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); // Get all users, newest first
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('❌ Error retrieving users:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Visit http://localhost:${PORT} to see the form`);
  console.log(`👥 Visit http://localhost:${PORT}/users to see all submissions`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down server...');
  await mongoose.connection.close();
  console.log('📤 MongoDB connection closed');
  process.exit(0);
});
```

**See in-line comments above for a detailed explanation of each line.**

---

### `public/script.js` — Line-by-Line Explanation
Below is a detailed explanation of **every line** in `public/script.js`:

```js
// JavaScript code for handling form submission

// Get references to form elements
const form = document.getElementById('contactForm'); // The form element
const submitBtn = document.getElementById('submitBtn'); // Submit button
const messageContainer = document.getElementById('messageContainer'); // Message display area

// Add event listener for form submission
form.addEventListener('submit', async function(event) {
    // Prevent the default form submission behavior (no page reload)
    event.preventDefault();
    
    // Show loading state on button
    submitBtn.textContent = 'Sending...';
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Clear any previous messages
    messageContainer.innerHTML = '';
    
    // Get form data
    const formData = new FormData(form);
    
    // Convert FormData to a regular object
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        age: formData.get('age'),
        message: formData.get('message')
    };
    
    try {
        // Send POST request to our server
        const response = await fetch('/submit-form', {
            method: 'POST', // HTTP method
            headers: {
                'Content-Type': 'application/json', // Tell server we're sending JSON
            },
            body: JSON.stringify(data) // Convert data to JSON string
        });
        
        // Parse the JSON response from server
        const result = await response.json();
        
        // Check if the request was successful
        if (result.success) {
            // Show success message
            showMessage('✅ ' + result.message, 'success');
            // Reset the form fields
            form.reset();
        } else {
            // Show error message
            showMessage('❌ ' + result.message, 'error');
        }
        
    } catch (error) {
        // Handle network or other errors
        console.error('Error:', error);
        showMessage('❌ Something went wrong. Please try again.', 'error');
    } finally {
        // Reset button state regardless of success or failure
        submitBtn.textContent = 'Send Message';
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});

// Function to display success or error messages
function showMessage(text, type) {
    // Create a new div element for the message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`; // Add CSS classes
    messageDiv.textContent = text; // Set the message text
    
    // Add the message to the container
    messageContainer.appendChild(messageDiv);
    
    // Automatically remove the message after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}
```

**See in-line comments above for a detailed explanation of each line.**

---

### `public/index.html`
- Contains the HTML structure for the contact form.
- Includes in-line CSS for styling.
- Uses `<form>` with fields for name, email, age, and message.
- Loads `script.js` for client-side logic.

### `public/script.js`
- Handles form submission using JavaScript.
- Prevents default form reload.
- Sends form data to `/submit-form` using `fetch` and displays feedback messages.
- Shows loading state on button and displays success/error messages.

---

## How to Run
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the server:**
   ```bash
   node server.js
   ```
3. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

---

## Dependencies
- express
- mongoose
- nodemon (for development, optional)
- path

---

## Security Note
- The MongoDB URI in `server.js` is for demonstration. For production, use environment variables and never commit credentials.

---

## Author
- Project generated and explained by Cascade AI
