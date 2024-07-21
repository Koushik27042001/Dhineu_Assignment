// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const session = require('express-session');
const jwt = require('jsonwebtoken');

// Initialize the Express application
const app = express();

// Use CORS middleware to allow cross-origin requests
app.use(cors());

// Use body-parser middleware to parse JSON bodies
app.use(bodyParser.json());

// Configure session middleware
app.use(session({
    secret: 'your-secret-key', // Secret key for session encryption (replace with a long random string)
    resave: false,             // Prevents session from being saved back to the session store if it wasn't modified
    saveUninitialized: true,   // Forces a session that is "uninitialized" to be saved to the store
    cookie: { secure: false }  // Set secure: true in production with HTTPS to ensure the cookie is only sent over HTTPS
}));

// Create a connection to the MySQL database
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Koushik@123',
    database: 'loginapp'
});

// Connect to the database and log a message if successful
db.connect(err => {
    if (err) throw err;
    console.log('Database connected!');
});

// Define a secret key for JWT (replace with a long random string)
const jwtSecret = 'your-jwt-secret';

// Endpoint for user login
app.post('/login', (req, res) => {
    const { username, password, rememberMe } = req.body; // Extract username, password, and rememberMe from the request body
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?'; // SQL query to find the user
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send({ message: 'Database error' }); // Return error if query fails
        }
        if (results.length > 0) {
            const user = results[0];
            const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: rememberMe ? '7d' : '1h' }); // Generate JWT

            // Store token in active_tokens table
            db.query('INSERT INTO active_tokens (token, user_id) VALUES (?, ?)', [token, user.id], (err) => {
                if (err) {
                    console.error('Error storing token:', err);
                }
            });

            res.send({ message: 'Login successful', token, userId: user.id }); // Send response with token and userId
        } else {
            res.status(401).send({ message: 'Invalid credentials' }); // Return error if credentials are invalid
        }
    });
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send({ message: 'No token provided' }); // Return error if no token is provided
    }

    jwt.verify(token.replace('Bearer ', ''), jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(500).send({ message: 'Failed to authenticate token' }); // Return error if token verification fails
        }
        req.userId = decoded.userId; // Attach userId to the request object
        next(); // Proceed to the next middleware or route handler
    });
};

// Fetch all users (protected route)
app.get('/users', verifyToken, (req, res) => {
    const query = 'SELECT * FROM users';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results); // Return the list of users
    });
});

// Add a user (protected route)
app.post('/users', verifyToken, (req, res) => {
    const newUser = req.body;
    const query = 'INSERT INTO users SET ?';
    db.query(query, newUser, (err, result) => {
        if (err) throw err;
        res.json({ message: 'User added successfully', id: result.insertId }); // Return success message with new user ID
    });
});

// Update a user (protected route)
app.put('/users/:id', verifyToken, (req, res) => {
    const userId = req.params.id;
    const updatedUser = req.body;
    const query = 'UPDATE users SET ? WHERE id = ?';
    db.query(query, [updatedUser, userId], (err, result) => {
        if (err) throw err;
        res.json({ message: 'User updated successfully' }); // Return success message
    });
});

// Delete a user (protected route)
app.delete('/users/:id', verifyToken, (req, res) => {
    const userId = req.params.id;
    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, userId, (err, result) => {
        if (err) throw err;
        res.json({ message: 'User deleted successfully' }); // Return success message
    });
});

// Endpoint to handle logout
app.post('/logout', (req, res) => {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (token) {
        db.query('DELETE FROM active_tokens WHERE token = ?', [token], (err) => {
            if (err) {
                console.error('Error removing token:', err);
                return res.status(500).json({ message: 'Logout failed' }); // Return error if token removal fails
            }

            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).json({ message: 'Logout failed' }); // Return error if session destruction fails
                }
                res.json({ message: 'Logout successful' }); // Return success message
            });
        });
    } else {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ message: 'Logout failed' }); // Return error if session destruction fails
            }
            res.json({ message: 'Logout successful' }); // Return success message
        });
    }
});

// Fetch the count of active tokens (protected route)
app.get('/active-tokens/count', verifyToken, (req, res) => {
    db.query('SELECT COUNT(*) AS count FROM active_tokens', (err, results) => {
        if (err) {
            console.error('Error fetching token count:', err);
            return res.status(500).send({ message: 'Database error' }); // Return error if query fails
        }
        res.json({ count: results[0].count }); // Return the count of active tokens
    });
});

// Fetch a user by ID (protected route)
app.get('/users/:id', verifyToken, (req, res) => {
    const userId = req.params.id;
    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send({ message: 'Database error' }); // Return error if query fails
        }
        if (results.length > 0) {
            res.json(results[0]); // Return the user data
        } else {
            res.status(404).send({ message: 'User not found' }); // Return error if user is not found
        }
    });
});

// Start the server on port 3000
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
