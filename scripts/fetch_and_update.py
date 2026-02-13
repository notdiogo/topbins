#!/usr/bin/env python3
"""
Automated stats fetcher for GitHub Actions CI.
Fetches stats from FBref/FotMob and updates constants.ts directly.

Usage:
    python3 scripts/fetch_and_update.py
"""

import soccerdata as sd
import json
import re
import os
from datetime import datetime
import warnings
import time
import sys
warnings.filterwarnings('ignore')

# Current season
SEASON = "2025-2026"

# =================================================================
# MANUAL FOTMOB RATINGS
# These are updated manually since FotMob doesn't expose player 
# ratings via their API. Update from:
# https://www.fotmob.com/leagues/47/stats/premier-league/players/rating
# =================================================================
FOTMOB_RATINGS = {
    "frimpong": 6.8,
    "nunes": 7.4,
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
        "team": "Arsenal",
    },
    "cherki": {
        "name": "Rayan Cherki",
        "search": ["Cherki"],
        "team": "Manchester City",
    },
    "frimpong": {
        "name": "Jeremie Frimpong",
        "search": ["Frimpong"],
        "team": "Liverpool",
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

# Bet ID to metrics mapping
BET_METRICS = {
    "bet_01": {"type": "assists", "playerA": "odegaard", "playerB": "bruno"},
    "bet_02": {"type": "g_a", "playerA": "zirkzee", "playerB": "madueke"},
    "bet_03": {"type": "g_a", "playerA": "zirkzee", "playerB": "cherki"},
    "bet_04": {"type": "rating", "playerA": "frimpong", "playerB": "nunes"},
    "bet_05": {"type": "g_a", "playerA": "cunha", "target": 20},
    "bet_06": {"type": "position", "teamA": "Liverpool", "teamB": "Manchester United"},
}


def get_fbref_stats_selenium():
    """Fetch player stats from FBref using Selenium."""
    print("🔄 Connecting to FBref via Selenium...")
    sys.stdout.flush()
    
    results = {}
    
    try:
        from seleniumbase import SB
        import pandas as pd
        from io import StringIO
        
        with SB(uc=True, headless=True) as sb:
            url = 'https://fbref.com/en/comps/9/stats/Premier-League-Stats'
            print(f"   Opening: {url}")
            sb.open(url)
            
            print("   Waiting for page to load...")
            time.sleep(8)
            
            html = sb.get_page_source()
            tables = pd.read_html(StringIO(html))
            print(f"   Found {len(tables)} tables")
            
            for table in tables:
                if len(table) > 100:
                    print(f"   Processing table with {len(table)} rows")
                    
                    if isinstance(table.columns, pd.MultiIndex):
                        table.columns = [' '.join(str(c) for c in col).strip() for col in table.columns]
                    
                    cols = list(table.columns)
                    player_col = next((c for c in cols if 'Player' in c), None)
                    gls_col = next((c for c in cols if c.endswith('Gls') or c == 'Gls'), None)
                    ast_col = next((c for c in cols if c.endswith('Ast') or c == 'Ast'), None)
                    
                    if not player_col:
                        continue
                    
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
                                }
                                print(f"   ✅ {info['name']}: {goals}G, {assists}A")
                                found = True
                                break
                        
                        if not found:
                            results[key] = {
                                "name": info["name"],
                                "team": info["team"],
                                "goals": 0,
                                "assists": 0,
                                "g_a": 0,
                            }
                            print(f"   ⚠️ {info['name']}: Not found")
                    
                    break
                    
    except Exception as e:
        print(f"   ❌ Selenium error: {e}")
        for key, info in PLAYERS.items():
            if key not in results:
                results[key] = {
                    "name": info["name"],
                    "team": info["team"],
                    "goals": 0,
                    "assists": 0,
                    "g_a": 0,
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
                    break
                    
    except Exception as e:
        print(f"   ❌ FotMob error: {e}")
    
    return standings


def update_constants_ts(stats, standings):
    """Update the constants.ts file with new stats."""
    print("\n📝 Updating constants.ts...")
    
    # Determine path (works from project root or scripts directory)
    constants_path = "constants.ts"
    if not os.path.exists(constants_path):
        constants_path = "../constants.ts"
    if not os.path.exists(constants_path):
        print("   ❌ Could not find constants.ts")
        return False
    
    with open(constants_path, 'r') as f:
        content = f.read()
    
    original_content = content
    
    # Update bet_01: Martin vs Bruno (Assists)
    odegaard_assists = stats.get("odegaard", {}).get("assists", 0)
    bruno_assists = stats.get("bruno", {}).get("assists", 0)
    content = update_bet_metrics(content, "bet_01", 
                                 label="Assists",
                                 valueA=odegaard_assists, 
                                 valueB=bruno_assists)
    print(f"   bet_01: Assists - Ødegaard {odegaard_assists}, Bruno {bruno_assists}")
    
    # Update bet_02: Zirkzee vs Noni (G/A)
    zirkzee_ga = stats.get("zirkzee", {}).get("g_a", 0)
    madueke_ga = stats.get("madueke", {}).get("g_a", 0)
    content = update_bet_metrics(content, "bet_02",
                                 label="G/A (All Comps)",
                                 valueA=zirkzee_ga,  # Zirkzee is A (Shiv backs)
                                 valueB=madueke_ga)  # Madueke is B (Mitch backs)
    print(f"   bet_02: G/A - Zirkzee {zirkzee_ga}, Madueke {madueke_ga}")
    
    # Update bet_03: Zirkzee vs Cherki (G/A)
    cherki_ga = stats.get("cherki", {}).get("g_a", 0)
    content = update_bet_metrics(content, "bet_03",
                                 label="G/A (All Comps)",
                                 valueA=zirkzee_ga,
                                 valueB=cherki_ga)
    print(f"   bet_03: G/A - Zirkzee {zirkzee_ga}, Cherki {cherki_ga}")
    
    # Update bet_04: Frimpong vs Nunes (Rating)
    frimpong_rating = FOTMOB_RATINGS.get("frimpong", 0)
    nunes_rating = FOTMOB_RATINGS.get("nunes", 0)
    content = update_bet_metrics(content, "bet_04",
                                 label="Avg Rating",
                                 valueA=frimpong_rating,
                                 valueB=nunes_rating)
    print(f"   bet_04: Rating - Frimpong {frimpong_rating}, Nunes {nunes_rating}")
    
    # Update bet_05: Cunha (Non-Pen G/A)
    cunha_ga = stats.get("cunha", {}).get("g_a", 0)
    content = update_bet_metrics_single(content, "bet_05",
                                        label="Non-Pen G/A",
                                        valueA=cunha_ga,
                                        target=20)
    print(f"   bet_05: Non-Pen G/A - Cunha {cunha_ga}")
    
    # Update bet_06: Liverpool vs United (League Position)
    liverpool_pos = standings.get("Liverpool", {}).get("position", 0)
    united_pos = standings.get("Manchester United", {}).get("position", 0)
    content = update_bet_metrics_position(content, "bet_06",
                                          valueA=liverpool_pos,
                                          valueB=united_pos)
    print(f"   bet_06: Position - Liverpool {liverpool_pos}, United {united_pos}")
    
    if content != original_content:
        with open(constants_path, 'w') as f:
            f.write(content)
        print("   ✅ constants.ts updated!")
        return True
    else:
        print("   ℹ️ No changes needed")
        return False


def update_bet_metrics(content, bet_id, label, valueA, valueB):
    """Update metrics for a standard A vs B bet."""
    # Find the bet block and update metrics within it
    pattern = rf"(id:\s*['\"]?{bet_id}['\"]?.*?metrics:\s*\{{[^}}]*?label:\s*['\"]){label}(['\"].*?valueA:\s*)\d+\.?\d*(.*?valueB:\s*)\d+\.?\d*"
    
    replacement = rf"\g<1>{label}\g<2>{valueA}\g<3>{valueB}"
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    return new_content


def update_bet_metrics_single(content, bet_id, label, valueA, target):
    """Update metrics for a single player bet with target."""
    pattern = rf"(id:\s*['\"]?{bet_id}['\"]?.*?metrics:\s*\{{[^}}]*?label:\s*['\"]){label}(['\"].*?valueA:\s*)\d+\.?\d*(.*?target:\s*)\d+"
    
    replacement = rf"\g<1>{label}\g<2>{valueA}\g<3>{target}"
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    return new_content


def update_bet_metrics_position(content, bet_id, valueA, valueB):
    """Update metrics for league position bet."""
    pattern = rf"(id:\s*['\"]?{bet_id}['\"]?.*?metrics:\s*\{{[^}}]*?label:\s*['\"]League Position['\"].*?valueA:\s*)\d+(.*?valueB:\s*)\d+"
    
    replacement = rf"\g<1>{valueA}\g<2>{valueB}"
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    return new_content


# =================================================================
# BET DEFINITIONS - Who participates in each bet
# =================================================================
BETS = [
    {
        "id": "bet_01",
        "type": "pvp",
        "participants": {"A": ["Mitch"], "B": ["Shiv"]},
        "metric": "assists",
        "playerA": "odegaard",
        "playerB": "bruno",
        "inverse": False
    },
    {
        "id": "bet_02",
        "type": "pvp",
        "participants": {"A": ["Shiv"], "B": ["Mitch"]},  # Shiv backs Zirkzee, Mitch backs Madueke
        "metric": "g_a",
        "playerA": "zirkzee",
        "playerB": "madueke",
        "inverse": False
    },
    {
        "id": "bet_03",
        "type": "pvp",
        "participants": {"A": ["Shiv"], "B": ["Diogo"]},
        "metric": "g_a",
        "playerA": "zirkzee",
        "playerB": "cherki",
        "inverse": False
    },
    {
        "id": "bet_04",
        "type": "pvp",
        "participants": {"A": ["Shiv"], "B": ["Diogo"]},
        "metric": "rating",
        "playerA": "frimpong",
        "playerB": "nunes",
        "inverse": False
    },
    {
        "id": "bet_05",
        "type": "threshold",
        "participants": {"A": ["Shiv"], "B": ["Diogo", "Mitch"]},
        "metric": "g_a",
        "player": "cunha",
        "target": 20
    },
    {
        "id": "bet_06",
        "type": "position",
        "participants": {"A": ["Mitch"], "B": ["Shiv"]},
        "teamA": "Liverpool",
        "teamB": "Manchester United",
        "inverse": True  # Lower position is better
    }
]


def calculate_standings(stats, standings):
    """Calculate current wins for each participant based on bet metrics."""
    wins = {"Diogo": 0, "Shiv": 0, "Mitch": 0}
    
    for bet in BETS:
        winner_side = None
        
        if bet["type"] == "pvp":
            # Player vs Player
            if bet["metric"] == "rating":
                valueA = FOTMOB_RATINGS.get(bet["playerA"], 0)
                valueB = FOTMOB_RATINGS.get(bet["playerB"], 0)
            else:
                metric = bet["metric"]
                valueA = stats.get(bet["playerA"], {}).get(metric, 0)
                valueB = stats.get(bet["playerB"], {}).get(metric, 0)
            
            if valueA == valueB:
                continue  # Draw
            
            if bet.get("inverse"):
                winner_side = "A" if valueA < valueB else "B"
            else:
                winner_side = "A" if valueA > valueB else "B"
                
        elif bet["type"] == "threshold":
            # Player threshold bet
            metric = bet["metric"]
            value = stats.get(bet["player"], {}).get(metric, 0)
            target = bet["target"]
            
            winner_side = "A" if value >= target else "B"
            
        elif bet["type"] == "position":
            # Team position bet
            posA = standings.get(bet["teamA"], {}).get("position", 20)
            posB = standings.get(bet["teamB"], {}).get("position", 20)
            
            if posA == posB:
                continue  # Draw
            
            # Lower position is better (inverse)
            winner_side = "A" if posA < posB else "B"
        
        # Award wins to participants on winning side
        if winner_side:
            for participant in bet["participants"][winner_side]:
                wins[participant] += 1
                
        print(f"   {bet['id']}: Side {winner_side} wins → {bet['participants'].get(winner_side, [])}")
    
    return wins


def update_last_updated(content):
    """Update the LAST_UPDATED timestamp in constants.ts."""
    from datetime import timezone, timedelta
    
    # Get current time in EST
    est = timezone(timedelta(hours=-5))
    now = datetime.now(est)
    
    # Format: "Thu Jan 16, 6:34 PM EST"
    formatted = now.strftime('%a %b %d, %-I:%M %p EST')
    
    print(f"\n🕐 Updating LAST_UPDATED to: {formatted}")
    
    # Replace the LAST_UPDATED line
    pattern = r"export const LAST_UPDATED = '[^']*';"
    replacement = f"export const LAST_UPDATED = '{formatted}';"
    
    content = re.sub(pattern, replacement, content)
    return content


def update_league_history(content, wins):
    """Update LEAGUE_HISTORY with current month's standings."""
    now = datetime.now()
    current_month = now.strftime('%b').upper()[:3]  # JAN, FEB, etc.
    current_year = now.strftime('%Y')
    
    print(f"\n📈 Updating LEAGUE_HISTORY for {current_month} {current_year}...")
    print(f"   Current standings: Diogo={wins['Diogo']}, Shiv={wins['Shiv']}, Mitch={wins['Mitch']}")
    
    # Check if current month already exists
    month_pattern = rf"\{{\s*month:\s*'{current_month}'.*?year:\s*'{current_year}'.*?\}}"
    existing_match = re.search(month_pattern, content, re.DOTALL)
    
    new_entry = f"""{{
    month: '{current_month}',
    year: '{current_year}',
    scores: {{
      Diogo: {wins['Diogo']},
      Shiv: {wins['Shiv']},
      Mitch: {wins['Mitch']}
    }}
  }}"""
    
    if existing_match:
        # Update existing month entry
        print(f"   Updating existing {current_month} entry...")
        content = re.sub(month_pattern, new_entry, content, flags=re.DOTALL)
    else:
        # Add new month entry before the closing bracket
        print(f"   Adding new {current_month} entry...")
        # Find the last } before ]; in LEAGUE_HISTORY and add comma + new entry
        pattern = r"(export const LEAGUE_HISTORY: MonthlyStanding\[\] = \[.*?})\s*\];"
        replacement = rf"\1,\n  {new_entry}\n];"
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    return content


def main():
    print("=" * 60)
    print("⚽ TopBins Auto Stats Update")
    print("📚 Sources: FBref (Selenium) + FotMob")
    print(f"📅 Season: {SEASON}")
    print(f"🕐 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    sys.stdout.flush()
    
    # Fetch stats
    stats = get_fbref_stats_selenium()
    time.sleep(1)
    standings = get_fotmob_standings()
    
    # Save raw data
    output = {
        "timestamp": datetime.now().isoformat(),
        "season": SEASON,
        "sources": ["FBref (Selenium)", "FotMob"],
        "players": stats,
        "standings": standings,
        "fotmob_ratings": FOTMOB_RATINGS
    }
    
    json_path = "scripts/latest_stats.json"
    if not os.path.exists("scripts"):
        json_path = "latest_stats.json"
    
    with open(json_path, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\n💾 Saved raw data to {json_path}")
    
    # Update constants.ts with bet metrics
    update_constants_ts(stats, standings)
    
    # Calculate participant standings
    print("\n🏆 Calculating bet standings...")
    wins = calculate_standings(stats, standings)
    
    # Update LEAGUE_HISTORY with current month
    constants_path = "constants.ts"
    if not os.path.exists(constants_path):
        constants_path = "../constants.ts"
    
    if os.path.exists(constants_path):
        with open(constants_path, 'r') as f:
            content = f.read()
        
        # Update timestamp
        content = update_last_updated(content)
        
        # Update league history
        content = update_league_history(content, wins)
        
        with open(constants_path, 'w') as f:
            f.write(content)
        print("   ✅ constants.ts updated!")
    
    print("\n" + "=" * 60)
    print("✅ Done!")
    print("=" * 60)


if __name__ == "__main__":
    main()
