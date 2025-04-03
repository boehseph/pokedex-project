const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize SQLite database
const db = new sqlite3.Database('./db/pokedex.db', (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
        // Create tables if they don't exist
        db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'guest')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `, (err) => {
            if (err) console.error('Table creation error:', err);
        });

        db.exec(`
            CREATE TABLE IF NOT EXISTS user_pokedex (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                pokemon_id TEXT NOT NULL,
                pokemon_name TEXT NOT NULL,
                pokemon_data TEXT NOT NULL,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id),
                UNIQUE(user_id, pokemon_id)
            );
        `, (err) => {
            if (err) console.error('Pokedex table creation error:', err);
        });
    }
});

// Make db available to all routes
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Session middleware (simplified)
app.use(session({
    secret: 'simple-key',
    cookie: { maxAge: 8 * 60 * 60 * 1000 } // 8 hours (duration of school day)
}));

app.use(express.json());

// Set up Handlebars
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Import routes
const routes = require('./routes/index');
app.use('/', routes);

// Start server
app.listen(PORT, () => {
    console.log("To Test: ")
    console.log(`http://localhost:${PORT}`);
    console.log(`http://localhost:${PORT}/register`);
    console.log(`http://localhost:${PORT}/login`);
});