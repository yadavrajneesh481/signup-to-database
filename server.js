
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
const MONGODB_URI = 'mongodb+srv://yadavrajneesh481:yadavrajneesh481@cluster0.vutzzt4.mongodb.net/'; // Local MongoDB
// For MongoDB Atlas (cloud), use: 'mongodb+srv://username:password@cluster.mongodb.net/formapp'

// Middleware setup
// Parse JSON bodies (for API requests)
app.use(express.json());
// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));
// Serve static files from 'public' directory
app.use(express.static('public'));

// Connect to MongoDB database
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

// Define a schema for our form data
// Schema defines the structure of documents in MongoDB collection
const userSchema = new mongoose.Schema({
  name: {
    type: String,      // Data type is string
    required: true,    // This field is mandatory
    trim: true        // Remove whitespace from beginning and end
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true   // Convert to lowercase
  },
  age: {
    type: Number,     // Data type is number
    required: true,
    min: 1,          // Minimum value is 1
    max: 120         // Maximum value is 120
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically set current date/time
  }
});

// Create a model from the schema
// Model is like a class that we use to create and manage documents
const User = mongoose.model('User', userSchema);

// Routes (URL endpoints)

// GET route - Serve the HTML form
app.get('/', (req, res) => {
  // Send the HTML file when someone visits the root URL
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST route - Handle form submission
app.post('/submit-form', async (req, res) => {
  try {
    // Extract form data from request body
    const { name, email, age, message } = req.body;
    
    // Create a new user document using our User model
    const newUser = new User({
      name: name,
      email: email,
      age: parseInt(age), // Convert age to number
      message: message
    });
    
    // Save the user data to MongoDB database
    const savedUser = await newUser.save();
    
    // Log successful save to console
    console.log('✅ User data saved:', savedUser);
    
    // Send success response back to client
    res.json({
      success: true,
      message: 'Form submitted successfully!',
      data: savedUser
    });
    
  } catch (error) {
    // Handle any errors that occur during saving
    console.error('❌ Error saving user data:', error);
    
    // Send error response back to client
    res.status(400).json({
      success: false,
      message: 'Error submitting form',
      error: error.message
    });
  }
});

// GET route - View all submitted forms (bonus feature)
app.get('/users', async (req, res) => {
  try {
    // Retrieve all users from database, sorted by creation date (newest first)
    const users = await User.find().sort({ createdAt: -1 });
    
    // Send users data as JSON response
    res.json({
      success: true,
      count: users.length,
      data: users
    });
    
  } catch (error) {
    // Handle errors when retrieving data
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
  // Close MongoDB connection
  await mongoose.connection.close();
  console.log('📤 MongoDB connection closed');
  process.exit(0);
});