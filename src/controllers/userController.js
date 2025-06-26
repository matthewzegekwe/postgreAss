// src/controllers/userController.js
import pool from '../../db.js'; // Adjust path based on your structure
import bcrypt from 'bcrypt';

// Helper function for basic email validation (can be more robust with regex)
const isValidEmail = (email) => {
    // Basic regex for email format validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Helper function for phone number validation (e.g., min length)
const isValidPhone = (phone) => {
    return phone && phone.length >= 7; // Minimum 7 digits for a phone number
};


// GET all users
// Includes pagination: /users?page=1&limit=10
export const getAllUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        // First, get the total count for pagination metadata
        const countResult = await pool.query('SELECT COUNT(*) FROM zegemathuserdb');
        const totalUsers = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalUsers / limit);

        // Fetch users with LIMIT and OFFSET
        const result = await pool.query(
            'SELECT id, name, email, phone, address, country, created_at FROM zegemathuserdb ORDER BY id LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        if (result.rows.length > 0) {
            console.log('Users fetched successfully');
            return res.status(200).json({
                data: result.rows,
                pagination: {
                    totalUsers,
                    totalPages,
                    currentPage: page,
                    pageSize: limit,
                    nextPage: page < totalPages ? page + 1 : null,
                    prevPage: page > 1 ? page - 1 : null,
                }
            });
        } else {
            return res.status(404).json({ message: 'No users found' });
        }
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return res.status(500).json({ error: 'Failed to fetch users due to a server error' });
    }
};

// GET a specific user by ID
export const getUserById = async (req, res) => {
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
};

// POST create a new user
export const createUser = async (req, res) => {
    const { name, email, phone, address, country, password } = req.body;

    // Enhanced validation
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }
    if (phone && !isValidPhone(phone)) {
        return res.status(400).json({ error: 'Invalid phone number format.' });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }


    try {
        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        const result = await pool.query(
            'INSERT INTO zegemathuserdb (name, email, phone, address, country, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, phone, address, country, created_at',
            [name, email, phone, address, country, hashedPassword]
        );
        console.log('User created successfully');
        // Do NOT return the hashed password in the response for security
        const newUser = { ...result.rows[0] };
        delete newUser.password; // Remove password before sending response
        return res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === '23505') { // PostgreSQL unique violation error code
            return res.status(409).json({ error: 'Email already exists.' });
        }
        return res.status(500).json({ error: 'Failed to create user due to a server error.' });
    }
};

// PUT update a user by ID
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address, country, password } = req.body;

    // Validate email if provided
    if (email && !isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }
    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
        return res.status(400).json({ error: 'Invalid phone number format.' });
    }
    // Validate password if provided
    if (password && password.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    try {
        let hashedPassword = undefined;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const result = await pool.query(
            'UPDATE zegemathuserdb SET name = COALESCE($1, name), email = COALESCE($2, email), phone = COALESCE($3, phone), address = COALESCE($4, address), country = COALESCE($5, country), password = COALESCE($6, password) WHERE id = $7 RETURNING id, name, email, phone, address, country, created_at',
            [name, email, phone, address, country, hashedPassword, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Do NOT return the hashed password in the response for security
        const updatedUser = { ...result.rows[0] };
        delete updatedUser.password;
        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error(`Failed to update user with ID ${id}:`, error);
        if (error.code === '23505') { // PostgreSQL unique violation error code
            return res.status(409).json({ error: 'Email already exists.' });
        }
        return res.status(500).json({ error: 'Failed to update user due to a server error.' });
    }
};

// DELETE a user by ID
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM zegemathuserdb WHERE id = $1 RETURNING id, name, email', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ message: 'User deleted successfully', deletedUser: result.rows[0] });
    } catch (error) {
        console.error(`Failed to delete user with ID ${id}:`, error);
        return res.status(500).json({ error: 'Failed to delete user due to a server error.' });
    }
};
