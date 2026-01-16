#!/usr/bin/env python3
"""
Fetch player stats using soccerdata library + Selenium fallback.
Data sources: FBref (via Selenium) + FotMob (standings)

Usage:
    python3 scripts/fetchStatsSoccerData.py
"""

import soccerdata as sd
import json
from datetime import datetime
import warnings
import time
import sys
warnings.filterwarnings('ignore')

# Current season
SEASON = "2025-2026"

# =================================================================
# MANUAL FOTMOB RATINGS
# Update these values by checking FotMob:
# https://www.fotmob.com/leagues/47/stats/premier-league/players/rating
# =================================================================
FOTMOB_RATINGS = {
    "frimpong": 6.83,  # Updated from FotMob
    "nunes": 7.48,     # Updated from FotMob
}

# Player mappings for 2025-26 season
PLAYERS = {
    "odegaard": {
        "name": "Martin Ødegaard",
        "search": ["Ødegaard", "Odegaard"],
        "team": "Arsenal",
    },
    "bruno": {
        "name": "Bruno Fernandes",
        "search": ["Bruno Fernandes"],
        "team": "Manchester Utd",
    },
    "zirkzee": {
        "name": "Joshua Zirkzee",
        "search": ["Zirkzee"],
        "team": "Manchester Utd",
    },
    "madueke": {
        "name": "Noni Madueke",
        "search": ["Madueke"],
        "team": "Arsenal",  # 2025-26 transfer
    },
    "cherki": {
        "name": "Rayan Cherki",
        "search": ["Cherki"],
        "team": "Manchester City",  # 2025-26 transfer
    },
    "frimpong": {
        "name": "Jeremie Frimpong",
        "search": ["Frimpong"],
        "team": "Liverpool",  # 2025-26 transfer
    },
    "nunes": {
        "name": "Matheus Nunes",
        "search": ["Matheus Nunes", "Nunes"],
        "team": "Manchester City",
    },
    "cunha": {
        "name": "Matheus Cunha",
        "search": ["Matheus Cunha", "Cunha"],
        "team": "Wolves",
    },
}


def get_fbref_stats_selenium():
    """Fetch player stats from FBref using Selenium (bypasses 403 blocking)."""
    print("🔄 Connecting to FBref via Selenium...")
    print("   (Using headless browser to bypass blocking)")
    sys.stdout.flush()
    
    results = {}
    
    try:
        from seleniumbase import SB
        import pandas as pd
        from io import StringIO
        
        with SB(uc=True, headless=True) as sb:
            url = 'https://fbref.com/en/comps/9/stats/Premier-League-Stats'
            print(f"   Opening: {url}")
            sys.stdout.flush()
            sb.open(url)
            
            print("   Waiting for page to load...")
            sys.stdout.flush()
            time.sleep(8)
            
            html = sb.get_page_source()
            tables = pd.read_html(StringIO(html))
            print(f"   Found {len(tables)} tables")
            sys.stdout.flush()
            
            # Find the main stats table
            for table in tables:
                if len(table) > 100:
                    print(f"\n📊 Processing table with {len(table)} rows")
                    sys.stdout.flush()
                    
                    # Flatten multi-index columns
                    if isinstance(table.columns, pd.MultiIndex):
                        table.columns = [' '.join(str(c) for c in col).strip() for col in table.columns]
                    
                    cols = list(table.columns)
                    
                    # Find columns
                    player_col = next((c for c in cols if 'Player' in c), None)
                    gls_col = next((c for c in cols if c.endswith('Gls') or c == 'Gls'), None)
                    ast_col = next((c for c in cols if c.endswith('Ast') or c == 'Ast'), None)
                    
                    if not player_col:
                        continue
                    
                    print(f"   Columns: Player={player_col}, Goals={gls_col}, Assists={ast_col}")
                    print("\n📋 Player Stats:")
                    sys.stdout.flush()
                    
                    for key, info in PLAYERS.items():
                        found = False
                        for search in info["search"]:
                            mask = table[player_col].astype(str).str.contains(search, case=False, na=False)
                            matches = table[mask]
                            if len(matches) > 0:
                                row = matches.iloc[0]
                                try:
                                    goals = int(float(row[gls_col])) if gls_col and pd.notna(row[gls_col]) else 0
                                except:
                                    goals = 0
                                try:
                                    assists = int(float(row[ast_col])) if ast_col and pd.notna(row[ast_col]) else 0
                                except:
                                    assists = 0
                                
                                results[key] = {
                                    "name": info["name"],
                                    "team": info["team"],
                                    "goals": goals,
                                    "assists": assists,
                                    "g_a": goals + assists,
                                    "source": "FBref (Selenium)"
                                }
                                print(f"   ✅ {info['name']}: {goals}G, {assists}A")
                                sys.stdout.flush()
                                found = True
                                break
                        
                        if not found:
                            results[key] = {
                                "name": info["name"],
                                "team": info["team"],
                                "goals": 0,
                                "assists": 0,
                                "g_a": 0,
                                "source": "Not found"
                            }
                            print(f"   ⚠️ {info['name']}: Not found")
                            sys.stdout.flush()
                    
                    break
                    
    except Exception as e:
        print(f"   ❌ Selenium error: {e}")
        sys.stdout.flush()
        # Set defaults
        for key, info in PLAYERS.items():
            if key not in results:
                results[key] = {
                    "name": info["name"],
                    "team": info["team"],
                    "goals": 0,
                    "assists": 0,
                    "g_a": 0,
                    "source": f"Error: {str(e)[:50]}"
                }
    
    return results


def get_fotmob_standings():
    """Fetch league standings from FotMob."""
    print("\n🔄 Connecting to FotMob...")
    sys.stdout.flush()
    
    standings = {}
    
    try:
        fotmob = sd.FotMob(leagues="ENG-Premier League", seasons=SEASON)
        
        print("   📊 Fetching league table...")
        sys.stdout.flush()
        table = fotmob.read_league_table()
        df = table.reset_index()
        
        teams_to_find = ["Liverpool", "Manchester United", "Arsenal", "Manchester City", "Wolves"]
        
        for idx, row in df.iterrows():
            team_name = str(row.get('team', ''))
            position = idx + 1
            pts = int(row.get('Pts', 0) or 0)
            
            for team in teams_to_find:
                if team.lower() in team_name.lower() or team_name.lower() in team.lower():
                    standings[team] = {"position": position, "points": pts}
                    print(f"   ✅ {team}: Position {position} ({pts} pts)")
                    sys.stdout.flush()
                    break
                    
    except Exception as e:
        print(f"   ❌ FotMob error: {e}")
        sys.stdout.flush()
    
    return standings


def format_metrics(stats, standings):
    """Format stats into the metrics structure for constants.ts"""
    
    metrics = {
        "bet_01": {
            "label": "Assists",
            "valueA": stats.get("odegaard", {}).get("assists", 0),
            "valueB": stats.get("bruno", {}).get("assists", 0),
        },
        "bet_02": {
            "label": "G/A (All Comps)",
            "valueA": stats.get("zirkzee", {}).get("g_a", 0),
            "valueB": stats.get("madueke", {}).get("g_a", 0),
        },
        "bet_03": {
            "label": "G/A (All Comps)",
            "valueA": stats.get("zirkzee", {}).get("g_a", 0),
            "valueB": stats.get("cherki", {}).get("g_a", 0),
        },
        "bet_04": {
            "label": "Avg Rating",
            "valueA": FOTMOB_RATINGS.get("frimpong", 0),  # From FotMob
            "valueB": FOTMOB_RATINGS.get("nunes", 0),     # From FotMob
        },
        "bet_05": {
            "label": "Non-Pen G/A",
            "valueA": stats.get("cunha", {}).get("g_a", 0),
            "target": 20,
        },
        "bet_06": {
            "label": "League Position",
            "valueA": standings.get("Liverpool", {}).get("position", 0),
            "valueB": standings.get("Manchester United", {}).get("position", 0),
            "isInverse": True,
            "maxValue": 20,
        }
    }
    
    return metrics


def main():
    print("=" * 60)
    print("⚽ TopBins Stats Fetcher")
    print("📚 Sources: FBref (Selenium) + FotMob")
    print(f"📅 Season: {SEASON}")
    print(f"🕐 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    sys.stdout.flush()
    
    # Fetch player stats from FBref via Selenium
    stats = get_fbref_stats_selenium()
    
    time.sleep(1)
    
    # Fetch league standings from FotMob
    standings = get_fotmob_standings()
    
    # Format metrics
    metrics = format_metrics(stats, standings)
    
    print("\n" + "=" * 60)
    print("📋 FINAL METRICS")
    print("=" * 60)
    print(json.dumps(metrics, indent=2))
    sys.stdout.flush()
    
    print("\n" + "=" * 60)
    print("📊 PLAYER STATS")
    print("=" * 60)
    print(json.dumps(stats, indent=2))
    sys.stdout.flush()
    
    # Save results
    output = {
        "timestamp": datetime.now().isoformat(),
        "season": SEASON,
        "sources": ["FBref (Selenium)", "FotMob"],
        "metrics": metrics,
        "players": stats,
        "standings": standings,
        "fotmob_ratings": FOTMOB_RATINGS
    }
    
    with open("scripts/latest_stats.json", "w") as f:
        json.dump(output, f, indent=2)
    print("\n💾 Saved to scripts/latest_stats.json")
    
    print("\n" + "=" * 60)
    print("📌 FOTMOB RATINGS (Manual Update)")
    print("=" * 60)
    print(f"   Frimpong: {FOTMOB_RATINGS.get('frimpong', 0)}")
    print(f"   Nunes: {FOTMOB_RATINGS.get('nunes', 0)}")
    print("\n   To update, edit FOTMOB_RATINGS in this script")
    print("   or check: https://www.fotmob.com/leagues/47/stats/premier-league/players/rating")
    sys.stdout.flush()


if __name__ == "__main__":
    main()
