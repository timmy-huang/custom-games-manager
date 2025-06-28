export const SUBREGIONS = {
  // Americas
  NA: {
    value: 'NA',
    label: 'North America',
    regionalEndpoint: 'na1',
    largeRegionalEndpoint: 'americas'
  },
  BR: {
    value: 'BR',
    label: 'Brazil',
    regionalEndpoint: 'br1',
    largeRegionalEndpoint: 'americas'
  },
  LAN: {
    value: 'LAN',
    label: 'Latin America North',
    regionalEndpoint: 'la1',
    largeRegionalEndpoint: 'americas'
  },
  LAS: {
    value: 'LAS',
    label: 'Latin America South',
    regionalEndpoint: 'la2',
    largeRegionalEndpoint: 'americas'
  },

  // Asia
  KR: {
    value: 'KR',
    label: 'Korea',
    regionalEndpoint: 'kr',
    largeRegionalEndpoint: 'asia'
  },
  JP: {
    value: 'JP',
    label: 'Japan',
    regionalEndpoint: 'jp1',
    largeRegionalEndpoint: 'asia'
  },
  OCE: {
    value: 'OCE',
    label: 'Oceania',
    regionalEndpoint: 'oc1',
    largeRegionalEndpoint: 'sea'
  },
  SEA: {
    value: 'SEA',
    label: 'South East Asia',
    regionalEndpoint: 'sg2',
    largeRegionalEndpoint: 'sea'
  },
  TW: {
    value: 'TW',
    label: 'Taiwan',
    regionalEndpoint: 'tw2',
    largeRegionalEndpoint: 'sea'
  },
  VN: {
    value: 'VN',
    label: 'Vietnam',
    regionalEndpoint: 'vn2',
    largeRegionalEndpoint: 'sea'
  },

  // Europe
  EUW: {
    value: 'EUW',
    label: 'Europe West',
    regionalEndpoint: 'euw1',
    largeRegionalEndpoint: 'europe'
  },
  EUNE: {
    value: 'EUNE',
    label: 'Europe Nordic & East',
    regionalEndpoint: 'eun1',
    largeRegionalEndpoint: 'europe'
  },
  ME: {
    value: 'ME',
    label: 'Middle East',
    regionalEndpoint: 'me1',
    largeRegionalEndpoint: 'europe'
  },
  RU: {
    value: 'RU',
    label: 'Russia',
    regionalEndpoint: 'ru',
    largeRegionalEndpoint: 'europe'
  },
  TR: {
    value: 'TR',
    label: 'Turkey',
    regionalEndpoint: 'tr1',
    largeRegionalEndpoint: 'europe'
  },
};

// Helper function to get regional endpoint for a subregion
export const getRegionalEndpoint = (subregion) => {
  return SUBREGIONS[subregion]?.regionalEndpoint || 'na1';
};

// Helper function to get large regional endpoint for a subregion
export const getLargeRegionalEndpoint = (subregion) => {
  return SUBREGIONS[subregion]?.largeRegionalEndpoint || 'americas';
};

// Legacy mappings for backward compatibility
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

// Legacy mappings for backward compatibility
export const LARGE_REGIONAL_ENDPOINTS = {
  // Americas
  AMERICAS: ['NA', 'BR', 'LAN', 'LAS'],
  ASIA: ['KR', 'JP'],
  EUROPE: ['EUW', 'EUNE', 'ME', 'RU', 'TR'],
  SEA: ['SEA', 'OCE', 'TW', 'VN'],
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