export const SUBREGIONS = {
  // Americas
  NA: { value: 'NA', label: 'North America', region: 'americas' },
  BR: { value: 'BR', label: 'Brazil', region: 'americas' },
  LAN: { value: 'LAN', label: 'Latin America North', region: 'americas' },
  LAS: { value: 'LAS', label: 'Latin America South', region: 'americas' },

  // Asia
  KR: { value: 'KR', label: 'Korea', region: 'asia' },
  JP: { value: 'JP', label: 'Japan', region: 'asia' },
  OCE: { value: 'OCE', label: 'Oceania', region: 'asia' },
  SEA: { value: 'SEA', label: 'South East Asia', region: 'asia' },
  TW: { value: 'TW', label: 'Taiwan', region: 'asia' },
  VN: { value: 'VN', label: 'Vietnam', region: 'asia' },

  // Europe
  EUW: { value: 'EUW', label: 'Europe West', region: 'europe' },
  EUNE: { value: 'EUNE', label: 'Europe Nordic & East', region: 'europe' },
  ME: { value: 'ME', label: 'Middle East', region: 'europe' },
  RU: { value: 'RU', label: 'Russia', region: 'europe' },
  TR: { value: 'TR', label: 'Turkey', region: 'europe' },
};

export const API_CONFIG = {
  BASE_URLS: {
    americas: 'https://americas.api.riotgames.com',
    asia: 'https://asia.api.riotgames.com',
    europe: 'https://europe.api.riotgames.com'
  },
  API_KEY: import.meta.env.VITE_RIOT_API_KEY,
  HEADERS: {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Charset': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Origin': 'https://developer.riotgames.com'
  }
}; 