<template>
  <div class="home-container">
    <h1 class="title">Custom Games Manager</h1>
    <p class="subtitle">Organize your League of Legends custom games with ease</p>

    <div class="search-section" v-if="!isLobbyCreated">
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
          :disabled="isLoading || addedPlayers.length >= 10"
        >
          <span v-if="isLoading">Loading...</span>
          <span v-else-if="addedPlayers.length >= 10">Lobby Full</span>
          <span v-else>Add Player</span>
        </button>
      </form>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>

    <div v-if="filteredSuggestedPlayers.length > 0 && !isLobbyCreated" class="suggested-players">
      <div class="suggestions-header">
        <h3>Suggested Players</h3>
        <div v-if="isAnalyzingMatches" class="analyzing-indicator">
          <div class="small-spinner"></div>
          <span>Updating...</span>
        </div>
      </div>
      <div class="players-row">
        <button 
          v-for="player in filteredSuggestedPlayers" 
          :key="player.gameName + player.tagLine"
          class="player-button"
          @click="addPlayer(player.gameName, player.tagLine, player.subregion)"
          :disabled="isLoading || addedPlayers.length >= 10"
        >
          {{ player.gameName }}#{{ player.tagLine }}
          <span class="plus-sign">+</span>
        </button>
      </div>
    </div>

    <div v-else-if="isAnalyzingMatches && !isLobbyCreated" class="analyzing-matches">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>Analyzing recent matches for teammate suggestions...</p>
      </div>
    </div>

    <div v-else-if="addedPlayers.length > 0 && !isLobbyCreated" class="no-suggestions">
      <p>No teammates found in recent matches</p>
    </div>

    <div v-if="!isLobbyCreated" class="waiting-lobby" :class="{ 'lobby-full': addedPlayers.length >= 10 }">
      <h3>Waiting Lobby ({{ addedPlayers.length }}/10)</h3>
      <div class="added-players">
        <div 
          v-for="player in addedPlayers" 
          :key="player.puuid"
          class="player-item"
        >
          <div class="player-info">
            <div class="player-details">
              <span class="player-name">{{ player.gameName }}#{{ player.tagLine }}</span>
              <!-- <span class="region-tag">{{ player.subregion }}</span> -->
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
      v-if="!isLobbyCreated"
      @click="createLobby" 
      class="create-lobby-button"
      :disabled="addedPlayers.length === 0 || isLoading"
    >
      Create Lobby
    </button>

    <!-- Team Display Section -->
    <div v-if="isLobbyCreated" class="teams-section">
      <h3>Balanced Teams</h3>
      <div class="teams-container">
        <div class="team team1">
          <h4>Team 1</h4>
          <div class="team-players">
            <div 
              v-for="player in team1" 
              :key="player.puuid"
              class="team-player"
            >
              <div class="player-info">
                <span class="player-name">{{ player.gameName }}#{{ player.tagLine }}</span>
                <div v-if="player.highestRank" class="player-rank">
                  {{ player.highestRank.tier }} {{ player.highestRank.rank }} ({{ player.highestRank.leaguePoints }} LP)
                </div>
                <div v-else class="no-rank">No rank data</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="team team2">
          <h4>Team 2</h4>
          <div class="team-players">
            <div 
              v-for="player in team2" 
              :key="player.puuid"
              class="team-player"
            >
              <div class="player-info">
                <span class="player-name">{{ player.gameName }}#{{ player.tagLine }}</span>
                <div v-if="player.highestRank" class="player-rank">
                  {{ player.highestRank.tier }} {{ player.highestRank.rank }} ({{ player.highestRank.leaguePoints }} LP)
                </div>
                <div v-else class="no-rank">No rank data</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="team-actions">
        <button @click="createTeamsAgain" class="create-again-button">
          Create Again
        </button>
        <button @click="startNewLobby" class="new-lobby-button">
          New Lobby
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue';
import { RiotApiService } from '../services/riotApi';
import { SUBREGIONS, getRegionalEndpoint, getLargeRegionalEndpoint } from '../config/api.config';

// Search form data
const gameNameQuery = ref('');
const tagLineQuery = ref('');
const selectedSubregion = ref('NA'); // Default to NA
const isLoading = ref(false);
const errorMessage = ref('');

// Store for player data
const addedPlayers = ref([]);

// Suggested players from match analysis or localStorage
const suggestedPlayers = ref([]);
const isAnalyzingMatches = ref(false);

// Team creation state
const teams = ref([]);
const isLobbyCreated = ref(false);
const team1 = ref([]);
const team2 = ref([]);

// Convert SUBREGIONS object to array for v-for
const subregionsList = Object.values(SUBREGIONS);

// Computed property to filter suggested players in real-time
const filteredSuggestedPlayers = computed(() => {
  // Create a set of existing player keys for quick lookup (case-insensitive)
  const existingPlayerKeys = new Set();
  addedPlayers.value.forEach(player => {
    existingPlayerKeys.add(`${player.gameName}#${player.tagLine}`.toLowerCase());
  });
  
  // Filter out players who are already in the waiting lobby and limit to 10 for display
  return suggestedPlayers.value
    .filter(suggestion => !existingPlayerKeys.has(`${suggestion.gameName}#${suggestion.tagLine}`.toLowerCase()))
    .slice(0, 5); // Only show up to 5 players at a time
});

// Load suggested players from localStorage
const loadSuggestedPlayers = () => {
  try {
    const stored = localStorage.getItem('suggestedPlayers');
    if (stored) {
      suggestedPlayers.value = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading suggested players:', error);
    suggestedPlayers.value = [];
  }
};

// Save suggested players to localStorage
const saveSuggestedPlayers = () => {
  try {
    localStorage.setItem('suggestedPlayers', JSON.stringify(suggestedPlayers.value));
  } catch (error) {
    console.error('Error saving suggested players:', error);
  }
};

// Add player to localStorage suggestions
const addToLocalSuggestions = (gameName, tagLine, subregion) => {
  const playerKey = `${gameName}#${tagLine}`.toLowerCase();
  
  // Check if player already exists in suggestions (case-insensitive)
  const existingIndex = suggestedPlayers.value.findIndex(
    p => `${p.gameName}#${p.tagLine}`.toLowerCase() === playerKey
  );
  
  if (existingIndex === -1) {
    // Add new player to suggestions
    suggestedPlayers.value.unshift({
      gameName,
      tagLine,
      subregion
    });
    
    // Keep only the last 30 suggestions
    if (suggestedPlayers.value.length > 30) {
      suggestedPlayers.value = suggestedPlayers.value.slice(0, 30);
    }
    
    saveSuggestedPlayers();
  }
};

// Analyze matches to find suggested players (optimized version)
const analyzeMatchesForSuggestions = async (newPlayerOnly = false) => {
  console.log('Analyzing matches for suggestions', newPlayerOnly ? '(new player only)' : '(all players)');
  
  if (addedPlayers.value.length === 0) {
    // If lobby is empty, load from localStorage
    loadSuggestedPlayers();
    return;
  }

  try {
    isAnalyzingMatches.value = true;
    const playerCounts = new Map(); // Map to track how many games each player appears in
    
    // Determine which players to analyze
    const playersToAnalyze = newPlayerOnly 
      ? addedPlayers.value.slice(-1) // Only analyze the most recently added player
      : addedPlayers.value;
    
    console.log(`Analyzing ${playersToAnalyze.length} player(s)`);
    
    // Process players asynchronously with Promise.all for better performance
    const analysisPromises = playersToAnalyze.map(async (player) => {
      const region = getLargeRegionalEndpoint(player.subregion) || 'na1';
      
      try {
        // Get recent match history for this player (reduced to 10 matches)
        const matchIds = await RiotApiService.getMatchHistory(player.puuid, region, 0, 10);
        
        // Process matches in parallel for better performance
        const matchPromises = matchIds.map(async (matchId) => {
          try {
            const matchDetails = await RiotApiService.getMatchDetails(matchId, region);
            
            if (matchDetails.info && matchDetails.info.participants) {
              // Find the current player in this match
              const currentPlayerParticipant = matchDetails.info.participants.find(
                p => p.puuid === player.puuid
              );
              
              if (currentPlayerParticipant) {
                const currentPlayerTeamId = currentPlayerParticipant.teamId;
                
                // Find all teammates (same teamId) in this match
                const teammates = matchDetails.info.participants.filter(
                  p => p.teamId === currentPlayerTeamId && p.puuid !== player.puuid
                );
              
                // Return teammates for this match
                return teammates.map(teammate => ({
                  gameName: teammate.riotIdGameName,
                  tagLine: teammate.riotIdTagline,
                  subregion: selectedSubregion.value
                }));
              }
            }
            return [];
          } catch (matchError) {
            console.error(`Error analyzing match ${matchId}:`, matchError);
            return [];
          }
        });
        
        // Wait for all matches to be processed
        const matchResults = await Promise.all(matchPromises);
        
        // Flatten and count teammates
        const allTeammates = matchResults.flat();
        for (const teammate of allTeammates) {
          const teammateKey = `${teammate.gameName}#${teammate.tagLine}`;
          const currentCount = playerCounts.get(teammateKey) || 0;
          playerCounts.set(teammateKey, currentCount + 1);
        }
        
      } catch (playerError) {
        console.error(`Error analyzing matches for player ${player.gameName}:`, playerError);
      }
    });
    
    // Wait for all players to be analyzed
    await Promise.all(analysisPromises);
    
    // Convert the map to an array and sort by frequency
    const newSuggestions = Array.from(playerCounts.entries())
      .map(([playerKey, count]) => {
        const [gameName, tagLine] = playerKey.split('#');
        return {
          gameName,
          tagLine,
          count,
          subregion: selectedSubregion.value
        };
      })
      .sort((a, b) => b.count - a.count) // Sort by frequency (highest first)
      .slice(0, 30); // Take top 30 suggestions instead of 10
    
    // If analyzing only new player, merge with existing suggestions
    if (newPlayerOnly && suggestedPlayers.value.length > 0) {
      // Create a map of existing suggestions for quick lookup
      const existingSuggestionsMap = new Map();
      suggestedPlayers.value.forEach(suggestion => {
        const key = `${suggestion.gameName}#${suggestion.tagLine}`;
        existingSuggestionsMap.set(key, suggestion);
      });
      
      // Merge new suggestions with existing ones
      newSuggestions.forEach(newSuggestion => {
        const key = `${newSuggestion.gameName}#${newSuggestion.tagLine}`;
        const existing = existingSuggestionsMap.get(key);
        
        if (existing) {
          // Update count if this player appears more frequently
          if (newSuggestion.count > existing.count) {
            existingSuggestionsMap.set(key, newSuggestion);
          }
        } else {
          // Add new suggestion
          existingSuggestionsMap.set(key, newSuggestion);
        }
      });
      
      // Convert back to array and sort
      suggestedPlayers.value = Array.from(existingSuggestionsMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 30);
    } else {
      // Replace all suggestions (already filtered above)
      suggestedPlayers.value = newSuggestions;
    }
    
  } catch (error) {
    console.error('Error analyzing matches for suggestions:', error);
    if (!newPlayerOnly) {
      suggestedPlayers.value = [];
    }
  } finally {
    isAnalyzingMatches.value = false;
  }
};

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

// Helper function to calculate rank score for team balancing
const calculateRankScore = (rank) => {
  if (!rank) return 0;
  
  const tierScore = getTierPriority(rank.tier) * 100;
  const rankScore = getRankPriority(rank.rank) * 25;
  const lpScore = rank.leaguePoints || 0;
  
  return tierScore + rankScore + lpScore;
};

// Function to create balanced teams
const createBalancedTeams = () => {
  // Get players with valid rank data
  const playersWithRanks = addedPlayers.value.filter(player => player.highestRank);
  const playersWithoutRanks = addedPlayers.value.filter(player => !player.highestRank);
  
  // Calculate rank scores for players with ranks
  const playersWithScores = playersWithRanks.map(player => ({
    ...player,
    rankScore: calculateRankScore(player.highestRank)
  }));
  
  // Sort players by rank score (highest first)
  playersWithScores.sort((a, b) => b.rankScore - a.rankScore);
  
  // Initialize teams
  const team1 = [];
  const team2 = [];
  let team1Score = 0;
  let team2Score = 0;
  
  // Distribute players with ranks using snake draft (alternating picks)
  for (let i = 0; i < playersWithScores.length; i++) {
    const player = playersWithScores[i];
    
    if (team1Score <= team2Score) {
      team1.push(player);
      team1Score += player.rankScore;
    } else {
      team2.push(player);
      team2Score += player.rankScore;
    }
  }
  
  // Distribute players without ranks evenly
  for (let i = 0; i < playersWithoutRanks.length; i++) {
    if (team1.length <= team2.length) {
      team1.push(playersWithoutRanks[i]);
    } else {
      team2.push(playersWithoutRanks[i]);
    }
  }
  
  return { team1, team2, team1Score, team2Score };
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
    
    const region = getRegionalEndpoint(player.subregion) || 'na1';
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
    
    // Update selectedSubregion if a specific subregion is provided (from suggested players)
    if (subregion !== selectedSubregion.value) {
      selectedSubregion.value = subregion;
    }
    
    const playerData = await RiotApiService.getAccountByRiotId(gameName, tagLine);
    
    // Check if lobby is full (max 10 players)
    if (addedPlayers.value.length >= 10) {
      errorMessage.value = 'Waiting lobby is full (maximum 10 players)';
      return;
    }
    
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
      
      // Add to localStorage suggestions to maintain a larger pool
      addToLocalSuggestions(gameName, tagLine, subregion);
      
      // Fetch ranks for the new player
      fetchPlayerRanks(newPlayer);
      
      // Analyze matches for suggestions (incremental - only analyze new player)
      analyzeMatchesForSuggestions(true);
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
  // Don't re-analyze matches when removing a player - keep existing suggestions
  // The suggestions will be filtered automatically when they're displayed
};

const createLobby = () => {
  console.log('Creating lobby with players:', addedPlayers.value);
  
  if (addedPlayers.value.length < 2) {
    errorMessage.value = 'Need at least 2 players to create teams';
    return;
  }
  
  // Create balanced teams
  const { team1: newTeam1, team2: newTeam2, team1Score, team2Score } = createBalancedTeams();
  
  // Update state
  team1.value = newTeam1;
  team2.value = newTeam2;
  isLobbyCreated.value = true;
  
  console.log('Teams created:', { team1: newTeam1, team2: newTeam2, team1Score, team2Score });
};

const createTeamsAgain = () => {
  createLobby();
};

const startNewLobby = () => {
  // Reset all state
  addedPlayers.value = [];
  team1.value = [];
  team2.value = [];
  isLobbyCreated.value = false;
  errorMessage.value = '';
  gameNameQuery.value = '';
  tagLineQuery.value = '';
  
  // Load suggested players from localStorage
  loadSuggestedPlayers();
};

// Load suggested players on component mount
loadSuggestedPlayers();
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
  transition: all 0.3s ease;
}

.lobby-full {
  background-color: #fff3cd;
  border: 2px solid #ffc107;
}

.lobby-full h3 {
  color: #856404;
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

.no-suggestions {
  text-align: center;
  margin: 2rem 0;
  padding: 2rem;
  color: #666;
  font-style: italic;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px dashed #ddd;
}

.game-count {
  font-size: 0.8rem;
  color: #666;
}

.analyzing-matches {
  text-align: center;
  margin: 2rem 0;
  padding: 2rem;
  color: #666;
  font-style: italic;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px dashed #ddd;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-subtitle {
  font-size: 0.9rem;
  color: #666;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.analyzing-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.small-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.teams-section {
  margin-top: 2rem;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.teams-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.team {
  flex: 1;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.team h4 {
  color: #333;
  margin-bottom: 1rem;
}

.team-players {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.team-player {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.player-info {
  text-align: center;
}

.player-name {
  font-weight: 500;
  color: #333;
}

.player-rank {
  color: #28a745;
  font-size: 0.8rem;
}

.no-rank {
  color: #999;
  font-size: 0.8rem;
  font-style: italic;
}

.team-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.create-again-button,
.new-lobby-button {
  padding: 0.8rem 1.5rem;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.create-again-button:hover:not(:disabled),
.new-lobby-button:hover:not(:disabled) {
  background-color: #1976D2;
}

.create-again-button:disabled,
.new-lobby-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style> 