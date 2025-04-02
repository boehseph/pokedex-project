const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up Handlebars with .hbs extension
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Import routes
const routes = require('./routes/index');
app.use('/', routes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
