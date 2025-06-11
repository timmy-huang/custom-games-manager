<template>
  <div class="home-container">
    <h1 class="title">Custom Games Manager</h1>
    <p class="subtitle">Organize your League of Legends custom games with ease</p>

    <div class="search-section">
      <form class="search-bar" @submit="handleSearch">
        <div class="select-container">
          <select 
            v-model="selectedSubregion"
            class="region-select"
            :disabled="isLoading"
          >
            <option
              v-for="subregion in subregionsList"
              :key="subregion.value"
              :value="subregion.value"
            >
              {{ selectedSubregion === subregion.value ? subregion.value : subregion.label }}
            </option>
          </select>
          <span class="dropdown-arrow">▼</span>
        </div>
        <div class="search-inputs">
          <div class="input-group">
            <input 
              v-model="gameNameQuery"
              type="text"
              placeholder="Game Name"
              required
              :disabled="isLoading"
            >
          </div>
          <div class="input-group">
            <span class="separator">#</span>
            <input 
              v-model="tagLineQuery"
              type="text"
              placeholder="Tagline"
              required
              :disabled="isLoading"
            >
          </div>
        </div>
        <button 
          type="submit" 
          class="add-button"
          :disabled="isLoading"
        >
          <span v-if="isLoading">Loading...</span>
          <span v-else>Add Player</span>
        </button>
      </form>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>

    <div class="suggested-players">
      <h3>Suggested Players</h3>
      <div class="players-row">
        <button 
          v-for="player in suggestedPlayers" 
          :key="player.gameName + player.tagLine"
          class="player-button"
          @click="addPlayer(player.gameName, player.tagLine, player.subregion)"
          :disabled="isLoading"
        >
          {{ player.gameName }}#{{ player.tagLine }}
          <span class="region-tag">{{ player.subregion }}</span>
        </button>
      </div>
    </div>

    <div class="waiting-lobby">
      <h3>Waiting Lobby</h3>
      <div class="added-players">
        <div 
          v-for="player in addedPlayers" 
          :key="player.puuid"
          class="player-item"
        >
          <div class="player-info">
            <span>{{ player.gameName }}#{{ player.tagLine }}</span>
            <span class="region-tag">{{ player.subregion }}</span>
          </div>
          <button 
            @click="removePlayer(player.puuid)" 
            class="remove-button"
            :disabled="isLoading"
          >
            Remove
          </button>
        </div>
      </div>
    </div>

    <button 
      @click="createLobby" 
      class="create-lobby-button"
      :disabled="addedPlayers.length === 0 || isLoading"
    >
      Create Lobby
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { RiotApiService } from '../services/riotApi';
import { SUBREGIONS } from '../config/api.config';

// Search form data
const gameNameQuery = ref('');
const tagLineQuery = ref('');
const selectedSubregion = ref('NA'); // Default to NA
const isLoading = ref(false);
const errorMessage = ref('');

// Store for player data
const addedPlayers = ref([]);

// Convert SUBREGIONS object to array for v-for
const subregionsList = Object.entries(SUBREGIONS).map(([key, value]) => ({
  value: value.value,
  label: value.label,
  region: value.region
}));

// Create a map of values to labels for the select
const valueToLabel = computed(() => {
  const map = new Map();
  Object.entries(SUBREGIONS).forEach(([key, value]) => {
    map.set(value.value, value.label);
  });
  return map;
});

// Mock suggested players with taglines
const suggestedPlayers = ref([
  { gameName: 'Faker', tagLine: 'KR1', subregion: 'KR' },
  { gameName: 'Caps', tagLine: 'EUW', subregion: 'EUW' },
  { gameName: 'Bjergsen', tagLine: 'NA1', subregion: 'NA' },
  { gameName: 'RNG-Wei', tagLine: 'CN1', subregion: 'KR' },
  { gameName: 'Jankos', tagLine: 'EUW', subregion: 'EUW' },
  { gameName: 'CoreJJ', tagLine: 'NA1', subregion: 'NA' }
]);

// Function to get main region from subregion
const getMainRegion = (subregion) => {
  return SUBREGIONS[subregion]?.region || 'americas';
};

// Function to add player
const addPlayer = async (gameName, tagLine, subregion = selectedSubregion.value) => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    const mainRegion = getMainRegion(subregion);
    const playerData = await RiotApiService.getAccountByRiotId(gameName, tagLine, mainRegion);
    
    // Check if player is already added
    if (!addedPlayers.value.some(p => p.puuid === playerData.puuid)) {
      addedPlayers.value.push({
        puuid: playerData.puuid,
        gameName: playerData.gameName,
        tagLine: playerData.tagLine,
        subregion: subregion
      });
    }
    
    // Clear search fields
    gameNameQuery.value = '';
    tagLineQuery.value = '';
  } catch (error) {
    errorMessage.value = error.message === 'API key is not configured' 
      ? 'Please configure your Riot API key in the .env file'
      : 'Could not find player. Please check the Game Name and Tagline.';
  } finally {
    isLoading.value = false;
  }
};

// Function to handle search form submission
const handleSearch = (event) => {
  event.preventDefault();
  if (gameNameQuery.value && tagLineQuery.value) {
    addPlayer(gameNameQuery.value, tagLineQuery.value);
  }
};

const removePlayer = (puuid) => {
  addedPlayers.value = addedPlayers.value.filter(p => p.puuid !== puuid);
};

const createLobby = () => {
  console.log('Creating lobby with players:', addedPlayers.value);
  // TODO: Implement lobby creation logic
};
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  text-align: center;
  margin-bottom: 3rem;
}

.search-section {
  margin-bottom: 2rem;
}

.search-bar {
  display: flex;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.select-container {
  position: relative;
  width: fit-content;
}

.region-select {
  padding: 0.8rem 1.2rem 0.8rem 0.4rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  background-color: white;
  font-size: 1rem;
  cursor: pointer;
  width: 4rem;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  color: #333;
}

.dropdown-arrow {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #666;
  font-size: 0.8rem;
}

.search-inputs {
  flex: 1;
  display: flex;
  gap: 0.5rem;
  background-color: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 0.4rem;
}

.input-group {
  display: flex;
  align-items: center;
}

.input-group:first-child {
  flex: 2;
}

.input-group:last-child {
  flex: 1;
}

.separator {
  color: #666;
  padding: 0 0.5rem;
  font-weight: bold;
}

.search-inputs input {
  width: 100%;
  padding: 0.4rem;
  border: none;
  font-size: 1rem;
  outline: none;
}

.add-button {
  padding: 0.8rem 1.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.add-button:hover:not(:disabled) {
  background-color: #45a049;
}

.players-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 1rem;
  justify-content: center;
}

.player-button {
  padding: 0.6rem 1.2rem;
  background-color: #7986CB;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.player-button:hover:not(:disabled) {
  background-color: #5C6BC0;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.waiting-lobby {
  margin: 2rem 0;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.added-players {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.player-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.player-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.region-tag {
  background-color: #e9ecef;
  color: #495057;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.remove-button {
  padding: 0.4rem 0.8rem;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.remove-button:hover:not(:disabled) {
  background-color: #cc0000;
}

.create-lobby-button {
  display: block;
  width: 100%;
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem;
  font-size: 1.2rem;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.create-lobby-button:hover:not(:disabled) {
  background-color: #1976D2;
}

.create-lobby-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

h3 {
  color: #333;
  margin-bottom: 1rem;
}
</style> 