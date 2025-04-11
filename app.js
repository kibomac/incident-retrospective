import express from 'express';
import path from 'path';
import session from 'express-session';
import router from './src/routes.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { configureSession, passUserToViews } from './src/middleware/middleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), 'src/views')); // Correct path to the views directory

// Middleware
app.use(express.json()); // For parsing JSON
app.use(express.static(path.join(path.resolve(), 'public')));
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded form data
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
                styleSrc: ["'self'", "https://cdn.jsdelivr.net"],
                imgSrc: ["'self'", "data:"],
            },
        },
    })
);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);

// Configure session middleware
app.use(configureSession());
app.use(passUserToViews);

// Routes
app.use(router);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).render('error', { message: err.message });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});