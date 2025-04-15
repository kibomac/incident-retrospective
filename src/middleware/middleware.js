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