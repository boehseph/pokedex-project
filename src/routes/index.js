const express = require('express');
const router = express.Router();

// Define a route for the home page
router.get('/', (req, res) => {
    res.render('home', {
        title: 'PokeDex'
        // No need to specify layout: 'main' as it's now the default
    });
});

// Define additional routes for Pokémon data here

module.exports = router;
