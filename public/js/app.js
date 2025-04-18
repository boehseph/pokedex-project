// API configuration for Pokemon TCG
const API_URL = 'https://api.pokemontcg.io/v2/cards/?q=name:';
const API_HEADERS = {
    'X-API-Key': '9d5b60c5-9b84-4e5b-b98c-dda45405df1f'
};

let currentSearch = 'pikachu';
let currentPokemon = null;

// Sets up all the interactive elements when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Handle search button
    const whosThatPokemonBtn = document.getElementById('whosThatPokemonBtn');
    if (whosThatPokemonBtn) {
        whosThatPokemonBtn.addEventListener('click', handleWhosThatPokemon);
    }

    // Handle add to pokedex button
    const addToPokedexBtn = document.getElementById('addToPokedexBtn');
    if (addToPokedexBtn) {
        addToPokedexBtn.addEventListener('click', addToPokedex);
    }

    // Handle search input for enter key
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleWhosThatPokemon();
            }
        });
    }

    // Initial load only on homepage
    if (window.location.pathname === '/') {
        resetSearch();
        fetchPokemon();
    }
});

// Checks if user is logged in before searching
async function handleWhosThatPokemon() {
    // Check if user is logged in
    try {
        const response = await fetch('/api/auth-status');
        const authStatus = await response.json();
        
        if (!authStatus.isLoggedIn) {
            window.location.href = '/login';
            return;
        }
        
        handleSearch();
    } catch (error) {
        console.error('Error checking auth status:', error);
        window.location.href = '/login';
    }
}

// Fetches Pokemon data from the API
async function fetchPokemon() {
    try {
        const response = await fetch(API_URL + currentSearch, { headers: API_HEADERS });
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            // Randomly select a Pokemon from the results
            const randomElement = Math.floor(Math.random() * data.data.length);
            currentPokemon = data.data[randomElement];
            updatePokemonDisplay(currentPokemon);
        } else {
            // Fallback to Pikachu if no results
            currentSearch = 'pikachu';
            fetchPokemon();
        }
    } catch (error) {
        console.error('Error fetching Pokemon:', error);
        // Fallback to Pikachu on error
        currentSearch = 'pikachu';
        fetchPokemon();
    }
}

// Updates the page to show Pokemon details
function updatePokemonDisplay(pokemon) {
    const container = document.getElementById('pokemonContainer');
    if (!pokemon) {
        container.innerHTML = '<p>No Pokemon found. Try another search!</p>';
        return;
    }
    
    const description = pokemon.flavorText ? 
        `<p><em>${pokemon.flavorText}</em></p>` : 
        `<p><em>This Pokemon doesn't have a description available.</em></p>`;
    
    container.innerHTML = `
        <section class="pokemon-container">
            <h1>${pokemon.name} (${pokemon.types?.join(', ') || ''})</h1>
            ${pokemon.rarity ? `<p><strong>Rarity:</strong> ${pokemon.rarity}</p>` : ''}
            ${pokemon.evolvesTo ? 
                `<p><strong>Evolves to:</strong> ${pokemon.evolvesTo.join(', or ')}</p>` : 
                `<p><strong>Evolves from:</strong> ${pokemon.evolvesFrom || 'n/a'}</p>`}
            <img src="${pokemon.images.small}" />
            ${description}
            <section class="pokemon-stats">
                <div>
                    ${pokemon.attacks ? `
                        <h2>Attacks</h2>
                        <ul>
                            ${pokemon.attacks.map(attack => `
                                <li><strong>${attack.name}:</strong> ${attack.text || 'n/a'}</li>
                            `).join('')}
                        </ul>
                    ` : ''}
                </div>
                <div>
                    ${pokemon.weaknesses ? `
                        <h2>Weaknesses</h2>
                        <ul>
                            ${pokemon.weaknesses.map(weakness => `
                                <li><strong>${weakness.type}:</strong> ${weakness.value}</li>
                            `).join('')}
                        </ul>
                    ` : ''}
                </div>
            </section>
        </section>
    `;
}

// Saves current Pokemon to user's pokedex
async function addToPokedex() {
    if (!currentPokemon) return;

    try {
        const response = await fetch('/api/add-to-pokedex', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pokemonData: currentPokemon
            })
        });

        const result = await response.json();
        
        if (response.ok) {
            alert(`${currentPokemon.name} added to your Pokedex!`);
        } else {
            alert(result.error || 'Failed to add to Pokedex');
        }
    } catch (error) {
        console.error('Error adding to Pokedex:', error);
        alert('Network error - please try again');
    }
}

// Handles search form submission
function handleSearch() {
    const input = document.getElementById('searchInput');
    currentSearch = input.value.trim().toLowerCase() || 'pikachu';
    input.value = '';
    fetchPokemon(); // Single fetch when searching
}

// Clears the search input field
function resetSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
}