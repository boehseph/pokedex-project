const express = require('express');
const router = express.Router();

// Define a route for the home page
router.get('/', (req, res) => {
    res.send('Welcome to the PokeDex API');
});

// Define additional routes for Pokémon data here

module.exports = router;
