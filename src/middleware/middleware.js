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