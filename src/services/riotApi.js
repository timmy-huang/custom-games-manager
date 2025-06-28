import { API_CONFIG } from '../config/api.config';

export class RiotApiService {
  static async getAccountByRiotId (gameName, tagLine) {
    try {
      if (!API_CONFIG.API_KEY) {
        throw new Error('API key is not configured');
      }

      const url = `${API_CONFIG.BASE_URL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...API_CONFIG.HEADERS,
          'X-Riot-Token': API_CONFIG.API_KEY
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) throw new Error('Invalid API key');
        throw new Error(errorData.status?.message || 'Failed to fetch player data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching account:', error);
      throw error;
    }
  }

  static async getPlayerRanks (puuid, region) {
    try {
      if (!API_CONFIG.API_KEY) {
        throw new Error('API key is not configured');
      }

      // Use the regional endpoint for league data
      const regionalUrl = `https://${region}.api.riotgames.com`;
      const url = `${regionalUrl}/lol/league/v4/entries/by-puuid/${puuid}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...API_CONFIG.HEADERS,
          'X-Riot-Token': API_CONFIG.API_KEY
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.status?.message || 'Failed to fetch player ranks');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching player ranks:', error);
      throw error;
    }
  }

  static async getMatchHistory (puuid, region, start = 0, count = 20) {
    try {
      if (!API_CONFIG.API_KEY) {
        throw new Error('API key is not configured');
      }

      // Use the regional endpoint for match history
      const regionalUrl = `https://${region}.api.riotgames.com`;
      const url = `${regionalUrl}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...API_CONFIG.HEADERS,
          'X-Riot-Token': API_CONFIG.API_KEY
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.status?.message || 'Failed to fetch match history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching match history:', error);
      throw error;
    }
  }

  static async getMatchDetails (matchId, region) {
    try {
      if (!API_CONFIG.API_KEY) {
        throw new Error('API key is not configured');
      }

      // Use the regional endpoint for match details
      const regionalUrl = `https://${region}.api.riotgames.com`;
      const url = `${regionalUrl}/lol/match/v5/matches/${matchId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...API_CONFIG.HEADERS,
          'X-Riot-Token': API_CONFIG.API_KEY
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.status?.message || 'Failed to fetch match details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching match details:', error);
      throw error;
    }
  }
} 