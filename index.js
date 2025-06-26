// index.js
import express from "express";
import pool from "./db.js"; // Correct import for ES Modules

const app = express();

const PORT = 7800; // Your specified port

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Endpoints ---

// GET all users
app.get('/users', async (req, res) => {
    try {
        // Querying the specific table name you provided
        const result = await pool.query('SELECT id, name, email, phone, address, country, created_at FROM zegemathuserdb ORDER BY id');
        if (result.rows.length > 0) {
            console.log('Users fetched successfully');
            return res.status(200).json(result.rows);
        } else {
            return res.status(404).json({ message: 'No users found' });
        }
    } catch (error) {
        console.error('Failed to fetch users:', error);
        // Provide more specific error info if possible, but avoid leaking sensitive details
        return res.status(500).json({ error: 'Failed to fetch users due to a server error' });
    }
});

// GET a specific user by ID
app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT id, name, email, phone, address, country, created_at FROM zegemathuserdb WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Failed to fetch user with ID ${id}:`, error);
        return res.status(500).json({ error: 'Failed to fetch user due to a server error' });
    }
});

// POST create a new user (renamed to /users for RESTful consistency, but kept /createuser as well)
app.post('/users', async (req, res) => {
    const { name, email, phone, address, country, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO zegemathuserdb (name, email, phone, address, country, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, phone, address, country, created_at',
            [name, email, phone, address, country, password] // Note: In a real app, hash the password!
        );
        console.log('User created successfully');
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === '23505') { // PostgreSQL unique violation error code
            return res.status(409).json({ error: 'Email already exists.' });
        }
        return res.status(500).json({ error: 'Failed to create user due to a server error.' });
    }
});

// Your original POST /createuser endpoint (kept for compatibility if you need it)
app.post('/createuser', async (req, res) => {
    const { name, email, phone, address, country, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO zegemathuserdb (name, email, phone, address, country, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, phone, address, country, created_at',
            [name, email, phone, address, country, password] // Note: In a real app, hash the password!
        );
        console.log('User created successfully');
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === '23505') { // PostgreSQL unique violation error code
            return res.status(409).json({ error: 'Email already exists.' });
        }
        return res.status(500).json({ error: 'Failed to create user due to a server error.' });
    }
});


// PUT update a user by ID
app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address, country, password } = req.body;

    try {
        const result = await pool.query(
            'UPDATE zegemathuserdb SET name = COALESCE($1, name), email = COALESCE($2, email), phone = COALESCE($3, phone), address = COALESCE($4, address), country = COALESCE($5, country), password = COALESCE($6, password) WHERE id = $7 RETURNING id, name, email, phone, address, country, created_at',
            [name, email, phone, address, country, password, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Failed to update user with ID ${id}:`, error);
        if (error.code === '23505') { // PostgreSQL unique violation error code
            return res.status(409).json({ error: 'Email already exists.' });
        }
        return res.status(500).json({ error: 'Failed to update user due to a server error.' });
    }
});

// DELETE a user by ID
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM zegemathuserdb WHERE id = $1 RETURNING id, name, email, phone, address, country', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ message: 'User deleted successfully', deletedUser: result.rows[0] });
    } catch (error) {
        console.error(`Failed to delete user with ID ${id}:`, error);
        return res.status(500).json({ error: 'Failed to delete user due to a server error.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is working at port ${PORT}`);
    console.log(`Access API at http://localhost:${PORT}`);
});