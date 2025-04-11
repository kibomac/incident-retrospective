export const ensureAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next(); // User is logged in, proceed to the next middleware/route
    }
    res.redirect('/'); // Redirect to the home page if not logged in
};