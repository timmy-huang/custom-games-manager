import { API_CONFIG } from '../config/api.config';

export class RiotApiService {
  static async getAccountByRiotId (gameName, tagLine, region = 'americas') {
    try {
      if (!API_CONFIG.API_KEY) {
        throw new Error('API key is not configured');
      }

      const baseUrl = API_CONFIG.BASE_URLS[region];
      if (!baseUrl) {
        throw new Error('Invalid region selected');
      }

      const url = `${baseUrl}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}?api_key=${API_CONFIG.API_KEY}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: API_CONFIG.HEADERS
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.status?.message || 'Failed to fetch player data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching account:', error);
      throw error;
    }
  }
} 