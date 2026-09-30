const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * Creates a signed JWT authentication token for a given user
 */
const generateAuthToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Sanitizes user object for API responses
 */
const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// POST /api/auth/register - Register a new customer account
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const isUserTaken = await User.findOne({ email: normalizedEmail });

    if (isUserTaken) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, passwordSalt);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: passwordHash,
    });

    const token = generateAuthToken(newUser);

    return res.status(201).json({
      token,
      user: formatUserResponse(newUser),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// POST /api/auth/login - Authenticate existing user credentials
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const matchedUser = await User.findOne({ email: normalizedEmail });

    if (!matchedUser) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, matchedUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateAuthToken(matchedUser);

    return res.json({
      token,
      user: formatUserResponse(matchedUser),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// GET /api/auth/me - Retrieve current profile of authenticated user
router.get('/me', protect, async (req, res) => {
  try {
    const profile = await User.findById(req.user.id).select('-password');
    if (!profile) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

module.exports = router;

