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
          <span class="plus-sign">+</span>
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
            <div class="player-details">
              <span class="player-name">{{ player.gameName }}#{{ player.tagLine }}</span>
              <span class="region-tag">{{ player.subregion }}</span>
            </div>
            <div class="rank-section">
              <div v-if="player.ranksLoading" class="rank-loading">
                Loading ranks...
              </div>
              <div v-else-if="player.highestRank" class="highest-rank">
                <span class="queue-type">{{ getQueueTypeLabel(player.highestRank.queueType) }}</span>
                <span class="rank-tier">{{ player.highestRank.tier }} {{ player.highestRank.rank }}</span>
                <span class="lp">{{ player.highestRank.leaguePoints }} LP</span>
              </div>
              <div v-else-if="player.ranksError" class="rank-error">
                {{ player.ranksError }}
              </div>
              <div v-else class="no-ranks">
                No rank data
              </div>
            </div>
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
import { ref, nextTick } from 'vue';
import { RiotApiService } from '../services/riotApi';
import { SUBREGIONS, REGIONAL_ENDPOINTS } from '../config/api.config';

// Search form data
const gameNameQuery = ref('');
const tagLineQuery = ref('');
const selectedSubregion = ref('NA'); // Default to NA
const isLoading = ref(false);
const errorMessage = ref('');

// Store for player data
const addedPlayers = ref([]);

// Convert SUBREGIONS object to array for v-for
const subregionsList = Object.values(SUBREGIONS);

// Mock suggested players with taglines
const suggestedPlayers = ref([
  { gameName: 'Faker', tagLine: 'KR1', subregion: 'KR' },
  { gameName: 'Caps', tagLine: 'EUW', subregion: 'EUW' },
  { gameName: 'Bjergsen', tagLine: 'NA1', subregion: 'NA' },
  { gameName: 'halcyonhunter', tagLine: 'oc', subregion: 'OCE' },
  { gameName: 'Jankos', tagLine: 'EUW', subregion: 'EUW' },
  { gameName: 'CoreJJ', tagLine: 'NA1', subregion: 'NA' }
]);

// Helper function to get queue type labels
const getQueueTypeLabel = (queueType) => {
  const labels = {
    'RANKED_SOLO_5x5': 'Solo/Duo',
    'RANKED_FLEX_SR': 'Flex',
    'RANKED_TFT': 'TFT',
    'RANKED_TFT_TURBO': 'TFT Turbo'
  };
  return labels[queueType] || queueType;
};

// Helper function to get tier priority (higher number = higher rank)
const getTierPriority = (tier) => {
  const priorities = {
    'IRON': 1,
    'BRONZE': 2,
    'SILVER': 3,
    'GOLD': 4,
    'PLATINUM': 5,
    'EMERALD': 6,
    'DIAMOND': 7,
    'MASTER': 8,
    'GRANDMASTER': 9,
    'CHALLENGER': 10
  };
  return priorities[tier] || 0;
};

// Helper function to get rank priority (lower number = higher rank)
const getRankPriority = (rank) => {
  const priorities = {
    'IV': 1,
    'III': 2,
    'II': 3,
    'I': 4
  };
  return priorities[rank] || 0;
};

// Helper function to determine the highest rank
const getHighestRank = (ranks) => {
  if (!ranks || ranks.length === 0) return null;
  
  // For arrays of size 1, return the first (and only) rank
  if (ranks.length === 1) return ranks[0];
  
  // For arrays of size 2, compare the two ranks
  if (ranks.length === 2) {
    const [rank1, rank2] = ranks;
    const tier1Priority = getTierPriority(rank1.tier);
    const tier2Priority = getTierPriority(rank2.tier);

    console.log('Tier 1 priority:', tier1Priority);
    console.log('Tier 2 priority:', tier2Priority);
    
    // If tiers are different, return the higher tier
    if (tier1Priority !== tier2Priority) {
      return tier1Priority > tier2Priority ? rank1 : rank2;
    }
    
    // If tiers are the same, compare ranks
    const rank1Priority = getRankPriority(rank1.rank);
    const rank2Priority = getRankPriority(rank2.rank);
    
    return rank1Priority > rank2Priority ? rank1 : rank2;
  }
  
  // Fallback for any other array size (shouldn't happen with max size 2)
  return ranks[0];
};

// Function to fetch player ranks
const fetchPlayerRanks = async (player) => {
  try {
    // Trigger reactivity by reassigning the player object
    const playerIndex = addedPlayers.value.findIndex(p => p.puuid === player.puuid);
    if (playerIndex !== -1) {
      addedPlayers.value[playerIndex] = {
        ...addedPlayers.value[playerIndex],
        ranksLoading: true,
        ranksError: null,
        highestRank: null
      };
    }
    
    const region = REGIONAL_ENDPOINTS[player.subregion] || 'na1';
    console.log(`Fetching ranks for ${player.gameName} in region: ${region}`);
    
    const ranks = await RiotApiService.getPlayerRanks(player.puuid, region);

    console.log('Raw ranks response:', ranks);
    console.log('Ranks type:', typeof ranks);
    console.log('Ranks length:', ranks ? ranks.length : 'null/undefined');
    
    const highestRank = getHighestRank(ranks);
    console.log('Highest rank:', highestRank);
    
    // Update the player with the fetched data
    if (playerIndex !== -1) {
      addedPlayers.value[playerIndex] = {
        ...addedPlayers.value[playerIndex],
        ranks: ranks,
        highestRank: highestRank,
        ranksLoading: false,
        ranksError: null
      };
    }
    
    console.log('Player state after fetch:', {
      ranksLoading: addedPlayers.value[playerIndex]?.ranksLoading,
      ranksError: addedPlayers.value[playerIndex]?.ranksError,
      highestRank: addedPlayers.value[playerIndex]?.highestRank,
      ranks: addedPlayers.value[playerIndex]?.ranks
    });
  } catch (error) {
    console.error('Error fetching ranks for player:', player.gameName, error);
    
    // Update the player with error state
    const playerIndex = addedPlayers.value.findIndex(p => p.puuid === player.puuid);
    if (playerIndex !== -1) {
      addedPlayers.value[playerIndex] = {
        ...addedPlayers.value[playerIndex],
        ranksLoading: false,
        ranksError: 'Failed to load ranks'
      };
    }
  }
};

// Function to add player
const addPlayer = async (gameName, tagLine, subregion = selectedSubregion.value) => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    const playerData = await RiotApiService.getAccountByRiotId(gameName, tagLine);
    
    // Check if player is already added
    if (!addedPlayers.value.some(p => p.puuid === playerData.puuid)) {
      const newPlayer = {
        puuid: playerData.puuid,
        gameName: playerData.gameName,
        tagLine: playerData.tagLine,
        subregion: subregion,
        ranks: null,
        ranksLoading: false,
        ranksError: null,
        highestRank: null
      };
      
      addedPlayers.value.push(newPlayer);
      
      // Fetch ranks for the new player
      fetchPlayerRanks(newPlayer);
    }
    
    // Clear search fields
    gameNameQuery.value = '';
    tagLineQuery.value = '';
  } catch (error) {
    console.log('Error:', error.message);
    errorMessage.value = error.message === 'Invalid API key' 
      ? 'Invalid API key'
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
  padding: 0.5rem 0.8rem;
  background-color: white;
  color: #333;
  border: 2px solid #7986CB;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
}

.player-button:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #5C6BC0;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.plus-sign {
  font-weight: bold;
  font-size: 1.1rem;
  color: #7986CB;
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
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0.8rem;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.player-info {
  display: contents;
}

.player-details {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-self: start;
}

.player-name {
  font-weight: 500;
  color: #333;
}

.region-tag {
  background-color: #e9ecef;
  color: #495057;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.rank-loading {
  color: #666;
  font-size: 0.8rem;
  font-style: italic;
}

.rank-error {
  color: #dc3545;
  font-size: 0.8rem;
}

.no-ranks {
  color: #999;
  font-size: 0.8rem;
  font-style: italic;
}

.highest-rank {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  padding: 0.2rem 0.4rem;
  background-color: #f8f9fa;
  border-radius: 3px;
  border: 1px solid #e9ecef;
}

.queue-type {
  color: #666;
  font-weight: 500;
  min-width: 60px;
}

.rank-tier {
  color: #333;
  font-weight: 600;
}

.lp {
  color: #28a745;
  font-weight: 500;
}

.rank-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

.remove-button {
  padding: 0.4rem 0.8rem;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  justify-self: end;
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