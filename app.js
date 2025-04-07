import express from 'express';
import path from 'path';
import session from 'express-session';
import router from './src/routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), 'src/views')); // Correct path to the views directory

// Middleware
app.use(express.json()); // For parsing JSON
app.use(express.static(path.join(path.resolve(), 'public')));
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded form data

// Configure session middleware
app.use(
    session({
        secret: process.env.SECRET_KEY || 'your-secret-key', // Use the secret key from .env
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Set `secure: true` if using HTTPS
    })
);

// Pass session user to all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null; // Pass `user` to all templates
    next();
});

// Routes
app.use(router);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});