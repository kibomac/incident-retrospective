import express from 'express';
import path from 'path';
import session from 'express-session';
import router from './src/routes.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { configureSession, passUserToViews } from './src/middleware/middleware.js';
import { config } from './src/config.js';

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), 'src/views')); 

// Middleware
app.use(express.json()); // For parsing JSON
app.use(express.static(path.join(path.resolve(), 'public')));
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded form data

// Security
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
        crossOriginEmbedderPolicy: true,
        referrerPolicy: { policy: "no-referrer" },
    })
);

if (isProduction) {
    app.use(helmet.hsts({ maxAge: 31536000 })); // Enforce HTTPS for 1 year
}

const limiter = rateLimit(config.rateLimit);
app.use(limiter);

app.use(session(config.session));

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