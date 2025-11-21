import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Get directory name in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const API_KEY = process.env.FOOTBALL_API_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';

// 2024-2025 Season
const SEASON = 2024; 
// Premier League ID = 39, Ligue 1 = 61, Bundesliga = 78
const LEAGUES = {
  EPL: 39,
  LIGUE1: 61,
  BUNDESLIGA: 78
};

// Map players to their API-Football IDs
const PLAYER_IDS = {
  ODEGAARD: 643,
  BRUNO: 1485,
  ZIRKZEE: 33045,
  MADUEKE: 134379,
  CHERKI: 107185,
  FRIMPONG: 3305,
  NUNES: 2527,
  CUNHA: 25485
};

async function getPlayerStats(playerId: number, leagueId: number = LEAGUES.EPL) {
  try {
    const response = await axios.get(`${BASE_URL}/players`, {
      params: {
        id: playerId,
        season: SEASON,
        league: leagueId
      },
      headers: {
        'x-apisports-key': API_KEY
      }
    });

    if (response.data.errors && Object.keys(response.data.errors).length > 0) {
        // Check for rate limit or other errors
        console.warn(`⚠️ API Warning for ID ${playerId}:`, JSON.stringify(response.data.errors));
        return null;
    }

    const data = response.data.response[0];
    if (!data) {
      console.warn(`⚠️ No data found for player ID ${playerId} in league ${leagueId}`);
      return null;
    }

    const stats = data.statistics[0];
    
    return {
      name: data.player.name,
      goals: stats.goals.total || 0,
      assists: stats.goals.assists || 0,
      rating: parseFloat(stats.games.rating) || 0.0
    };
  } catch (error) {
    console.error(`❌ Error fetching player ${playerId}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

async function main() {
  if (!API_KEY) {
    console.error("❌ Missing FOOTBALL_API_KEY in .env.local");
    console.log("👉 Get one for free at https://dashboard.api-football.com/");
    console.log("   Then add: FOOTBALL_API_KEY=your_key_here to .env.local");
    return;
  }

  console.log("🔄 Connecting to Football API...");

  // 1. Odegaard vs Bruno (EPL)
  const odegaard = await getPlayerStats(PLAYER_IDS.ODEGAARD);
  const bruno = await getPlayerStats(PLAYER_IDS.BRUNO);

  // 2. Zirkzee vs Madueke (EPL)
  const zirkzee = await getPlayerStats(PLAYER_IDS.ZIRKZEE);
  const madueke = await getPlayerStats(PLAYER_IDS.MADUEKE);

  // 3. Cherki (Ligue 1) - fetch from league 61
  const cherki = await getPlayerStats(PLAYER_IDS.CHERKI, LEAGUES.LIGUE1); 

  // 4. Frimpong (Bundesliga) vs Nunes (EPL)
  const frimpong = await getPlayerStats(PLAYER_IDS.FRIMPONG, LEAGUES.BUNDESLIGA);
  const nunes = await getPlayerStats(PLAYER_IDS.NUNES);

  // 5. Cunha (EPL)
  const cunha = await getPlayerStats(PLAYER_IDS.CUNHA);

  console.log("\n✅ Data Fetch Complete. Here are the updated metrics:\n");
  
  const metrics = {
    bet_01: {
      label: 'Assists',
      valueA: odegaard?.assists || 0,
      valueB: bruno?.assists || 0
    },
    bet_02: {
      label: 'G/A (All Comps)',
      valueA: (zirkzee?.goals || 0) + (zirkzee?.assists || 0),
      valueB: (madueke?.goals || 0) + (madueke?.assists || 0)
    },
    bet_03: {
      label: 'G/A (All Comps)',
      valueA: (zirkzee?.goals || 0) + (zirkzee?.assists || 0),
      valueB: (cherki?.goals || 0) + (cherki?.assists || 0)
    },
    bet_04: {
      label: 'Avg Rating',
      valueA: frimpong?.rating || 0,
      valueB: nunes?.rating || 0
    },
    bet_05: {
      label: 'Non-Pen G/A',
      valueA: (cunha?.goals || 0) + (cunha?.assists || 0),
      target: 20
    }
  };

  console.log(JSON.stringify(metrics, null, 2));
  console.log("\n📋 Copy the object above or modify this script to write directly to constants.ts");
}

main();

