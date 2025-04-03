import express from 'express';
import path from 'path';
import routes from './src/routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), 'src/views')); // Correct path to the views directory

// Middleware
app.use(express.json());
app.use(express.static(path.join(path.resolve(), 'public')));

// Routes
app.use('/', routes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});