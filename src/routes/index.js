const express = require('express');
const router = express.Router();

// Home page
router.get('/', (req, res) => {
    if (req.session.userId) {
        // Get username from database if logged in
        req.db.get(
            'SELECT username FROM users WHERE id = ?',
            [req.session.userId],
            (err, user) => {
                if (err || !user) {
                    return res.render('home', {
                        title: 'PokeDex',
                        isLoggedIn: false
                    });
                }
                res.render('home', {
                    title: 'PokeDex',
                    isLoggedIn: true,
                    username: user.username
                });
            }
        );
    } else {
        res.render('home', {
            title: 'PokeDex',
            isLoggedIn: false
        });
    }
});

// Login page
router.get('/login', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    res.render('login', { 
        title: 'Login - PokeDex',
        error: req.query.error 
    });
});

// Login handler
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    req.db.get(
        'SELECT * FROM users WHERE username = ? AND password_hash = ?',
        [username, password],
        (err, user) => {
            if (err || !user) {
                return res.redirect('/login?error=Invalid username or password');
            }
            
            req.session.userId = user.id;
            req.session.userType = user.user_type;
            res.redirect('/');
        }
    );
});

// Registration handler
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    
    req.db.run(
        'INSERT INTO users (username, password_hash, user_type) VALUES (?, ?, ?)',
        [username, password, 'guest'],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.redirect('/register?error=Username already taken');
                }
                return res.redirect('/register?error=Registration failed');
            }
            res.redirect('/login');
        }
    );
});

// Logout handler
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Session destruction error:', err);
        }
        res.redirect('/');
    });
});

// Registration page
router.get('/register', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    res.render('register', { 
        title: 'Register - PokeDex',
        error: req.query.error 
    });
});

router.get('/user-pokedex/:userId?', (req, res) => {
    // If user isn't logged in at all, redirect to login
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    // If no userId specified, use the logged in user's ID
    const userId = req.params.userId || req.session.userId;
    
    // Check if the requesting user is admin or the owner of the pokedex
    const isAdmin = req.session.userType === 'admin';
    const isOwner = userId == req.session.userId;
    
    // Only proceed if user is admin or owner
    if (!isAdmin && !isOwner) {
        return res.status(403).send('Forbidden');
    }
    
    req.db.all(
        `SELECT pokemon_data FROM user_pokedex 
         WHERE user_id = ? 
         ORDER BY added_at DESC`,
        [userId],
        (err, pokemons) => {
            if (err) {
                console.error(err);
                return res.redirect('/');
            }
            
            const pokemonCards = pokemons.map(p => JSON.parse(p.pokemon_data));
            
            req.db.get(
                'SELECT username FROM users WHERE id = ?',
                [userId],
                (err, user) => {
                    if (err || !user) {
                        return res.redirect('/');
                    }
                    res.render('user-profile', {
                        title: `${user.username}'s Pokedex`,
                        isLoggedIn: true,
                        isAdmin: isAdmin,
                        viewingOwnPokedex: !req.params.userId, // true if no userId param
                        username: user.username,
                        pokemonCards: pokemonCards
                    });
                }
            );
        }
    );
});

// These last 4 endpoints are for testing purposes 

// Get all users (admin only)
router.get('/api/all-users', (req, res) => {
    if (!req.session.userId || req.session.userType !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    
    req.db.all(
        'SELECT id, username FROM users WHERE user_type = ?',
        ['guest'],
        (err, users) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(users);
        }
    );
});

router.post('/api/add-to-pokedex', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { pokemonData } = req.body;
    
    // Add validation
    if (!pokemonData || !pokemonData.id) {
        return res.status(400).json({ error: 'Invalid Pokemon data' });
    }

    const pokemonId = pokemonData.id;

    req.db.run(
        'INSERT INTO user_pokedex (user_id, pokemon_id, pokemon_name, pokemon_data) VALUES (?, ?, ?, ?)',
        [req.session.userId, pokemonId, pokemonData.name, JSON.stringify(pokemonData)],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Pokemon already in Pokedex' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ success: true });
        }
    );
});

// Auth status endpoint
router.get('/api/auth-status', (req, res) => {
    res.json({ 
        isLoggedIn: !!req.session.userId,
        isAdmin: req.session.userType === 'admin'
    });
});

// User data endpoint
router.get('/api/user-data', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    req.db.get(
        'SELECT id, username, user_type, created_at FROM users WHERE id = ?',
        [req.session.userId],
        (err, user) => {
            if (err || !user) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(user);
        }
    );
});

module.exports = router;