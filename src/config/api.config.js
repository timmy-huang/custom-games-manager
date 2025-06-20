export const SUBREGIONS = {
  // Americas
  NA: { value: 'NA', label: 'North America' },
  BR: { value: 'BR', label: 'Brazil' },
  LAN: { value: 'LAN', label: 'Latin America North' },
  LAS: { value: 'LAS', label: 'Latin America South' },

  // Asia
  KR: { value: 'KR', label: 'Korea' },
  JP: { value: 'JP', label: 'Japan' },
  OCE: { value: 'OCE', label: 'Oceania' },
  SEA: { value: 'SEA', label: 'South East Asia' },
  TW: { value: 'TW', label: 'Taiwan' },
  VN: { value: 'VN', label: 'Vietnam' },

  // Europe
  EUW: { value: 'EUW', label: 'Europe West' },
  EUNE: { value: 'EUNE', label: 'Europe Nordic & East' },
  ME: { value: 'ME', label: 'Middle East' },
  RU: { value: 'RU', label: 'Russia' },
  TR: { value: 'TR', label: 'Turkey' },
};

// Mapping of subregions to regional endpoints for rank API
export const REGIONAL_ENDPOINTS = {
  // Americas
  NA: 'na1',
  BR: 'br1',
  LAN: 'la1',
  LAS: 'la2',

  // Asia
  KR: 'kr',
  JP: 'jp1',
  OCE: 'oc1',
  SEA: 'sg2',
  TW: 'tw2',
  VN: 'vn2',

  // Europe
  EUW: 'euw1',
  EUNE: 'eun1',
  ME: 'me1',
  RU: 'ru',
  TR: 'tr1',
};

export const API_CONFIG = {
  BASE_URL: 'https://asia.api.riotgames.com',
  API_KEY: import.meta.env.VITE_RIOT_API_KEY,
  HEADERS: {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Charset': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Origin': 'https://developer.riotgames.com'
  }
}; 