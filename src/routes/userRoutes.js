// src/routes/userRoutes.js
import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} from '../controllers/userController.js'; // Adjust path

const router = express.Router();

router.get('/', getAllUsers); // GET /users (with pagination support)
router.get('/:id', getUserById); // GET /users/:id
router.post('/', createUser); // POST /users
router.put('/:id', updateUser); // PUT /users/:id
router.delete('/:id', deleteUser); // DELETE /users/:id

export default router;
