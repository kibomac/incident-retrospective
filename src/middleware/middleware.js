import session from 'express-session';

export const configureSession = () =>
    session({
        secret: process.env.SECRET_KEY || 'your-secret-key',
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
        },
    });

export const passUserToViews = (req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
};

export const addHelpersToViews = (req, res, next) => {
    res.locals.formatDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };
    next();
};

export const notFoundHandler = (req, res, next) => {
    const error = new Error('404 Not Found');
    error.status = 404;
    next(error);
};

export const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    // const statusMessages = {
    //     400: '400 Bad Request',
    //     401: '401 Unauthorized',
    //     403: '403 Forbidden',
    //     404: '404 Not Found',
    // };

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(status).json({ error: message });
    }

    // res.status(status).render('error', {    
    //     message: statusMessages[status] || message,
    //     path: req.originalUrl,
    //     method: req.method,
    //     stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    //     timestamp: new Date().toISOString(),
    // });

    res.status(status).render('error', { message });
};

let requestCounts = {};

export const rateLimiter = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!requestCounts[ip]) {
        requestCounts[ip] = [];
    }

    requestCounts[ip] = requestCounts[ip].filter((timestamp) => now - timestamp < 60000);

    requestCounts[ip].push(now);

    if (requestCounts[ip].length > 100) {
        return res.status(429).send('Too many requests. Please try again later.');
    }

    next();
};

export const ensureAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).send('403 Forbidden');
};


