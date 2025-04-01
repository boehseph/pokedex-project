const API_URL = 'https://api.pokemontcg.io/v2/cards/?q=name:';
const API_HEADERS = {
    'X-API-Key': '3bb65ffc-e69b-4c02-9eb7-9b5ea098d0b8'
};

let currentSearch = 'pikachu';

async function fetchPokemon() {
    try {
        const response = await fetch(API_URL + currentSearch, { headers: API_HEADERS });
        const data = await response.json();
        const randomElement = Math.floor(Math.random() * data.data.length);
        updatePokemonDisplay(data.data[randomElement]);
    } catch (error) {
        console.error('Error fetching Pokemon:', error);
    }
}

function updatePokemonDisplay(pokemon) {
    const container = document.getElementById('pokemonContainer');
    if (!pokemon) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <section class="pokemon-container">
            <h1>${pokemon.name} (${pokemon.types?.join(', ') || ''})</h1>
            ${pokemon.evolvesTo ? 
                `<p><strong>Evolves to:</strong> ${pokemon.evolvesTo.join(', or ')}</p>` : 
                `<p><strong>Evolves from:</strong> ${pokemon.evolvesFrom || 'n/a'}</p>`}
            <img src="${pokemon.images.small}" />
            <p><em>${pokemon.flavorText}</em></p>
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

function handleSearch() {
    const input = document.getElementById('searchInput');
    currentSearch = input.value.trim().toLowerCase() || 'pikachu';
    input.value = '';
    fetchPokemon();
}

// Initial load
fetchPokemon();
