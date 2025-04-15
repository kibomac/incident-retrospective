import express from 'express';
import path from 'path';
import session from 'express-session';
import router from './src/routes.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { configureSession, passUserToViews, addHelpersToViews } from './src/middleware/middleware.js';
import { config } from './src/config.js';

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), 'src/views'));

app.use(express.json());
app.use(express.static(path.join(path.resolve(), 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(addHelpersToViews);

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
    app.use(helmet.hsts({ maxAge: 31536000 }));
}

const limiter = rateLimit(config.rateLimit);
app.use(limiter);

app.use(session(config.session));
app.use(configureSession());
app.use(passUserToViews);

app.use(router);

app.use((err, req, res, next) => {
    res.status(err.status || 500).render('error', { message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});