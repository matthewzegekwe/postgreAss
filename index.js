// index.js
import express from 'express';
import dotenv from 'dotenv'; // Import dotenv to load SERVER_PORT
import userRoutes from './src/routes/userRoutes.js'; // Import user routes

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.SERVER_PORT || 3000; // Use port from .env or default to 3000

// Middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Mount the user routes
app.use('/users', userRoutes); // All routes defined in userRoutes will be prefixed with /users

// Basic root route for testing if the server is up
app.get('/', (req, res) => {
    res.status(200).json({ message: 'User API is running!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is working at port ${PORT}`);
    console.log(`Access API at http://localhost:${PORT}`);
});
