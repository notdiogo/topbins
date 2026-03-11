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

# ── Optional Supabase integration ────────────────────────────
# Activated when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set.
# When not configured the scraper continues to update constants.ts only.
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_ENABLED = bool(SUPABASE_URL and SUPABASE_KEY)

_supabase_client = None

def _get_supabase():
    """Lazily initialise the Supabase client (requires `supabase` package)."""
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client
    try:
        from supabase import create_client
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("   ✅ Supabase client initialised")
    except ImportError:
        print("   ⚠️  `supabase` package not installed — skipping Supabase writes")
        _supabase_client = False  # sentinel so we don't retry
    return _supabase_client

# ------------------------------------------------------------------
# Paths — always resolve relative to this script's location so it
# works regardless of the current working directory (repo root,
# scripts/, or anywhere else).
# ------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
CONSTANTS_PATH = os.path.join(PROJECT_ROOT, "constants.ts")
LATEST_STATS_PATH = os.path.join(SCRIPT_DIR, "latest_stats.json")

IS_CI = os.environ.get("CI") == "true"

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

# Teams we care about for standings
TEAMS_TO_FIND = {
    "Liverpool": ["liverpool"],
    "Manchester United": ["manchester united", "manchester utd", "man united", "man utd"],
    "Arsenal": ["arsenal"],
    "Manchester City": ["manchester city", "man city"],
    "Wolves": ["wolves", "wolverhampton"],
}


def _parse_stats_table(table):
    """Extract player stats from a pandas DataFrame (works for both Selenium and soccerdata)."""
    import pandas as pd

    results = {}

    if isinstance(table.columns, pd.MultiIndex):
        table.columns = [' '.join(str(c) for c in col).strip() for col in table.columns]

    cols = list(table.columns)
    player_col = next((c for c in cols if 'Player' in c or 'player' in c), None)
    gls_col = next((c for c in cols if c.endswith('Gls') or c == 'Gls' or 'goal' in c.lower()), None)
    ast_col = next((c for c in cols if c.endswith('Ast') or c == 'Ast' or 'assist' in c.lower()), None)

    if not player_col:
        return results

    for key, info in PLAYERS.items():
        found = False
        for search in info["search"]:
            mask = table[player_col].astype(str).str.contains(search, case=False, na=False)
            matches = table[mask]
            if len(matches) > 0:
                row = matches.iloc[0]
                try:
                    goals = int(float(row[gls_col])) if gls_col and pd.notna(row[gls_col]) else 0
                except (ValueError, TypeError):
                    goals = 0
                try:
                    assists = int(float(row[ast_col])) if ast_col and pd.notna(row[ast_col]) else 0
                except (ValueError, TypeError):
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

    return results


def get_fbref_stats_selenium():
    """Fetch player stats from FBref using Selenium."""
    print("🔄 Fetching player stats via Selenium...")
    sys.stdout.flush()

    try:
        from seleniumbase import SB
        import pandas as pd
        from io import StringIO

        # In CI, skip uc (undetected-chrome) mode — it patches the
        # Chrome binary and is fragile on cloud runners.  Regular
        # headless mode works fine because FBref doesn't block simple
        # headless requests from GitHub Actions IPs (yet).
        sb_kwargs = {"headless": True}
        if not IS_CI:
            sb_kwargs["uc"] = True

        with SB(**sb_kwargs) as sb:
            url = 'https://fbref.com/en/comps/9/stats/Premier-League-Stats'
            print(f"   Opening: {url}")
            sb.open(url)

            wait_time = 12 if IS_CI else 8
            print(f"   Waiting {wait_time}s for page to load...")
            sys.stdout.flush()
            time.sleep(wait_time)

            html = sb.get_page_source()
            tables = pd.read_html(StringIO(html))
            print(f"   Found {len(tables)} tables")

            for table in tables:
                if len(table) > 100:
                    print(f"   Processing table with {len(table)} rows")
                    results = _parse_stats_table(table)
                    if results:
                        return results

    except Exception as e:
        print(f"   ❌ Selenium error: {e}")
        sys.stdout.flush()

    return {}


def get_fbref_stats_soccerdata():
    """Fallback: fetch stats via soccerdata's FBref reader (no browser needed)."""
    print("🔄 Fetching player stats via soccerdata FBref reader (fallback)...")
    sys.stdout.flush()

    try:
        fbref = sd.FBref(leagues="ENG-Premier League", seasons=SEASON)
        stats_df = fbref.read_player_season_stats(stat_type="standard")
        stats_df = stats_df.reset_index()

        results = _parse_stats_table(stats_df)
        if results:
            return results
    except Exception as e:
        print(f"   ❌ soccerdata FBref error: {e}")
        sys.stdout.flush()

    return {}


def get_standings_fbref_selenium():
    """Fetch EPL standings from FBref using Selenium."""
    print("\n🔄 Fetching EPL standings via Selenium...")
    sys.stdout.flush()

    standings = {}

    try:
        from seleniumbase import SB
        import pandas as pd
        from io import StringIO

        sb_kwargs = {"headless": True}
        if not IS_CI:
            sb_kwargs["uc"] = True

        with SB(**sb_kwargs) as sb:
            url = 'https://fbref.com/en/comps/9/Premier-League-Stats'
            print(f"   Opening: {url}")
            sb.open(url)

            wait_time = 12 if IS_CI else 8
            print(f"   Waiting {wait_time}s for page to load...")
            sys.stdout.flush()
            time.sleep(wait_time)

            html = sb.get_page_source()
            tables = pd.read_html(StringIO(html))
            print(f"   Found {len(tables)} tables")

            # The standings table typically has 20 rows (20 teams)
            for table in tables:
                if len(table) >= 18 and len(table) <= 22:
                    cols = list(table.columns)
                    if isinstance(table.columns, pd.MultiIndex):
                        table.columns = [' '.join(str(c) for c in col).strip() for col in table.columns]
                        cols = list(table.columns)

                    squad_col = next((c for c in cols if 'Squad' in c or 'Team' in c), None)
                    rk_col = next((c for c in cols if 'Rk' in c), None)
                    pts_col = next((c for c in cols if 'Pts' in c), None)

                    if not squad_col:
                        continue

                    print(f"   📊 Found standings table with columns: {', '.join(cols[:8])}")

                    for idx, row in table.iterrows():
                        team_name = str(row[squad_col]).lower()

                        try:
                            position = int(float(row[rk_col])) if rk_col and pd.notna(row[rk_col]) else idx + 1
                        except (ValueError, TypeError):
                            position = idx + 1

                        try:
                            pts = int(float(row[pts_col])) if pts_col and pd.notna(row[pts_col]) else 0
                        except (ValueError, TypeError):
                            pts = 0

                        for canonical, aliases in TEAMS_TO_FIND.items():
                            if any(alias in team_name for alias in aliases):
                                standings[canonical] = {"position": position, "points": pts}
                                print(f"   ✅ {canonical}: Position {position} ({pts} pts)")
                                break

                    if standings:
                        break

    except Exception as e:
        print(f"   ❌ FBref standings error: {e}")

    return standings


def get_standings_soccerdata():
    """Fallback: fetch standings via soccerdata's FotMob reader."""
    print("   Trying soccerdata FotMob as fallback for standings...")
    sys.stdout.flush()

    standings = {}

    try:
        fotmob = sd.FotMob(leagues="ENG-Premier League", seasons=SEASON)
        table = fotmob.read_league_table()
        df = table.reset_index()

        for idx, row in df.iterrows():
            team_name = str(row.get('team', '')).lower()
            position = idx + 1
            pts = int(row.get('Pts', 0) or 0)

            for canonical, aliases in TEAMS_TO_FIND.items():
                if any(alias in team_name for alias in aliases):
                    standings[canonical] = {"position": position, "points": pts}
                    print(f"   ✅ {canonical}: Position {position} ({pts} pts)")
                    break

    except Exception as e:
        print(f"   ❌ FotMob fallback error: {e}")

    return standings


def update_constants_ts(stats, standings, has_fbref_data=True):
    """Update the constants.ts file with new stats."""
    print("\n📝 Updating constants.ts...")

    if not os.path.exists(CONSTANTS_PATH):
        print(f"   ❌ Could not find constants.ts at {CONSTANTS_PATH}")
        return False

    with open(CONSTANTS_PATH, 'r') as f:
        content = f.read()

    original_content = content

    if has_fbref_data:
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
                                     valueA=zirkzee_ga,
                                     valueB=madueke_ga)
        print(f"   bet_02: G/A - Zirkzee {zirkzee_ga}, Madueke {madueke_ga}")
        
        # Update bet_03: Zirkzee vs Cherki (G/A)
        cherki_ga = stats.get("cherki", {}).get("g_a", 0)
        content = update_bet_metrics(content, "bet_03",
                                     label="G/A (All Comps)",
                                     valueA=zirkzee_ga,
                                     valueB=cherki_ga)
        print(f"   bet_03: G/A - Zirkzee {zirkzee_ga}, Cherki {cherki_ga}")
        
        # Update bet_05: Cunha (Non-Pen G/A)
        cunha_ga = stats.get("cunha", {}).get("g_a", 0)
        content = update_bet_metrics_single(content, "bet_05",
                                            label="Non-Pen G/A",
                                            valueA=cunha_ga,
                                            target=20)
        print(f"   bet_05: Non-Pen G/A - Cunha {cunha_ga}")
    else:
        print("   ⏭️  Skipping player bets (bet_01–bet_05) — no FBref data")
    
    # bet_04 always updates (uses manual FOTMOB_RATINGS, not FBref)
    frimpong_rating = FOTMOB_RATINGS.get("frimpong", 0)
    nunes_rating = FOTMOB_RATINGS.get("nunes", 0)
    content = update_bet_metrics(content, "bet_04",
                                 label="Avg Rating",
                                 valueA=frimpong_rating,
                                 valueB=nunes_rating)
    print(f"   bet_04: Rating - Frimpong {frimpong_rating}, Nunes {nunes_rating}")
    
    # bet_06 always updates if we have standings
    liverpool_pos = standings.get("Liverpool", {}).get("position", 0)
    united_pos = standings.get("Manchester United", {}).get("position", 0)
    if liverpool_pos > 0 or united_pos > 0:
        content = update_bet_metrics_position(content, "bet_06",
                                              valueA=liverpool_pos,
                                              valueB=united_pos)
        print(f"   bet_06: Position - Liverpool {liverpool_pos}, United {united_pos}")
    else:
        print(f"   bet_06: ⏭️  Skipping — no standings data")

    if content != original_content:
        with open(CONSTANTS_PATH, 'w') as f:
            f.write(content)
        print("   ✅ constants.ts updated!")
        return True
    else:
        print("   ℹ️ No changes needed")
        return False


def update_bet_metrics(content, bet_id, label, valueA, valueB):
    """Update metrics for a standard A vs B bet."""
    escaped_label = re.escape(label)
    pattern = rf"(id:\s*['\"]?{bet_id}['\"]?.*?metrics:\s*\{{[^}}]*?label:\s*['\"]){escaped_label}(['\"].*?valueA:\s*)\d+\.?\d*(.*?valueB:\s*)\d+\.?\d*"
    
    replacement = rf"\g<1>{label}\g<2>{valueA}\g<3>{valueB}"
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    return new_content


def update_bet_metrics_single(content, bet_id, label, valueA, target):
    """Update metrics for a single player bet with target."""
    escaped_label = re.escape(label)
    pattern = rf"(id:\s*['\"]?{bet_id}['\"]?.*?metrics:\s*\{{[^}}]*?label:\s*['\"]){escaped_label}(['\"].*?valueA:\s*)\d+\.?\d*(.*?target:\s*)\d+"
    
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
        "participants": {"A": ["Shiv"], "B": ["Mitch"]},
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
            metric = bet["metric"]
            value = stats.get(bet["player"], {}).get(metric, 0)
            target = bet["target"]
            
            winner_side = "A" if value >= target else "B"
            
        elif bet["type"] == "position":
            posA = standings.get(bet["teamA"], {}).get("position", 20)
            posB = standings.get(bet["teamB"], {}).get("position", 20)
            
            if posA == posB:
                continue  # Draw
            
            # Lower position is better (inverse)
            winner_side = "A" if posA < posB else "B"
        
        if winner_side:
            for participant in bet["participants"][winner_side]:
                wins[participant] += 1
                
        print(f"   {bet['id']}: Side {winner_side} wins → {bet['participants'].get(winner_side, [])}")
    
    return wins


def update_last_updated(content):
    """Update the LAST_UPDATED timestamp in constants.ts."""
    from datetime import timezone, timedelta
    
    est = timezone(timedelta(hours=-5))
    now = datetime.now(est)
    
    # Format: "Thu Jan 16, 6:34 PM EST"
    # Use platform-safe formatting (%-I on macOS/Linux, but %#I on Windows)
    try:
        formatted = now.strftime('%a %b %d, %-I:%M %p EST')
    except ValueError:
        formatted = now.strftime('%a %b %d, %I:%M %p EST')
    
    print(f"\n🕐 Updating LAST_UPDATED to: {formatted}")
    
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
    month_pattern = rf"\{{\s*month:\s*'{current_month}'.*?year:\s*'{current_year}'.*?\}}\s*\}}"
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
        print(f"   Updating existing {current_month} entry...")
        content = re.sub(month_pattern, new_entry, content, flags=re.DOTALL)
    else:
        print(f"   Adding new {current_month} entry...")
        pattern = r"(export const LEAGUE_HISTORY: MonthlyStanding\[\] = \[.*?\}\s*\})\s*\];"
        replacement = rf"\1,\n  {new_entry}\n];"
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    return content


def push_to_supabase(stats, standings, wins, formatted_timestamp, has_fbref_data=True):
    """Write live metrics to Supabase. Only runs when credentials are set."""
    if not SUPABASE_ENABLED:
        print("\n⏭️  Supabase not configured — skipping remote write (set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)")
        return

    sb = _get_supabase()
    if not sb:
        return

    print("\n☁️  Pushing data to Supabase...")

    # ── Update bet metrics ──────────────────────────────────
    bet_updates = []

    if has_fbref_data:
        odegaard_assists = stats.get("odegaard", {}).get("assists", 0)
        bruno_assists    = stats.get("bruno", {}).get("assists", 0)
        bet_updates.append(("bet_01", {"label": "Assists", "valueA": odegaard_assists, "valueB": bruno_assists}))

        zirkzee_ga = stats.get("zirkzee", {}).get("g_a", 0)
        madueke_ga = stats.get("madueke", {}).get("g_a", 0)
        cherki_ga  = stats.get("cherki",  {}).get("g_a", 0)
        bet_updates.append(("bet_02", {"label": "G/A (All Comps)", "valueA": zirkzee_ga, "valueB": madueke_ga}))
        bet_updates.append(("bet_03", {"label": "G/A (All Comps)", "valueA": zirkzee_ga, "valueB": cherki_ga}))

        cunha_ga = stats.get("cunha", {}).get("g_a", 0)
        bet_updates.append(("bet_05", {"label": "Non-Pen G/A", "valueA": cunha_ga, "target": 20}))

    frimpong_rating = FOTMOB_RATINGS.get("frimpong", 0)
    nunes_rating    = FOTMOB_RATINGS.get("nunes",    0)
    bet_updates.append(("bet_04", {"label": "Avg Rating", "valueA": frimpong_rating, "valueB": nunes_rating}))

    liverpool_pos = standings.get("Liverpool",         {}).get("position", 0)
    united_pos    = standings.get("Manchester United", {}).get("position", 0)
    if liverpool_pos > 0 or united_pos > 0:
        bet_updates.append(("bet_06", {"label": "League Position", "valueA": liverpool_pos, "valueB": united_pos, "isInverse": True, "maxValue": 20}))

    for bet_id, metrics in bet_updates:
        try:
            sb.table("bets").update({"metrics": metrics}).eq("id", bet_id).execute()
            print(f"   ✅ {bet_id} metrics updated")
        except Exception as e:
            print(f"   ❌ {bet_id} update failed: {e}")

    # ── Upsert league history for current month ─────────────
    now = datetime.now()
    current_month = now.strftime('%b').upper()[:3]
    current_year  = now.strftime('%Y')
    scores = {"Diogo": wins["Diogo"], "Shiv": wins["Shiv"], "Mitch": wins["Mitch"]}

    try:
        sb.table("league_history").upsert(
            {"month": current_month, "year": current_year, "scores": scores},
            on_conflict="month,year"
        ).execute()
        print(f"   ✅ league_history {current_month} {current_year} upserted")
    except Exception as e:
        print(f"   ❌ league_history upsert failed: {e}")

    # ── Update last_updated timestamp ───────────────────────
    try:
        sb.table("app_meta").upsert(
            {"key": "last_updated", "value": formatted_timestamp},
            on_conflict="key"
        ).execute()
        print(f"   ✅ app_meta last_updated set to: {formatted_timestamp}")
    except Exception as e:
        print(f"   ❌ app_meta update failed: {e}")


def main():
    print("=" * 60)
    print("⚽ TopBins Auto Stats Update")
    print("📚 Sources: FBref (Selenium) + soccerdata + FotMob")
    print(f"📅 Season: {SEASON}")
    print(f"🕐 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📂 Project root: {PROJECT_ROOT}")
    print(f"🤖 CI mode: {IS_CI}")
    print("=" * 60)
    sys.stdout.flush()
    
    # ---------- Fetch player stats ----------
    stats = get_fbref_stats_selenium()

    if not stats or all(s.get("goals", 0) == 0 and s.get("assists", 0) == 0 for s in stats.values()):
        print("\n⚠️  Selenium returned no player data — trying soccerdata fallback...")
        stats = get_fbref_stats_soccerdata()

    time.sleep(1)

    # ---------- Fetch standings ----------
    standings = get_standings_fbref_selenium()

    if not standings:
        print("\n⚠️  Selenium returned no standings — trying soccerdata fallback...")
        standings = get_standings_soccerdata()

    # ---------- Evaluate what we got ----------
    has_fbref_data = any(
        s.get("goals", 0) > 0 or s.get("assists", 0) > 0
        for s in stats.values()
    ) if stats else False

    has_standings_data = bool(standings)
    
    if not has_fbref_data and not has_standings_data:
        print("\n⚠️  No data from any source — skipping all updates.")
        print("\n" + "=" * 60)
        print("⚠️  Skipped (no data)")
        print("=" * 60)
        return
    
    if not has_fbref_data:
        print("\n⚠️  Player stats scrape returned no data — will skip player bets but still update standings.")
    
    # ---------- Save raw data ----------
    output = {
        "timestamp": datetime.now().isoformat(),
        "season": SEASON,
        "sources": ["FBref (Selenium)", "soccerdata", "FotMob"],
        "players": stats,
        "standings": standings,
        "fotmob_ratings": FOTMOB_RATINGS
    }
    
    with open(LATEST_STATS_PATH, "w") as f:
        json.dump(output, f, indent=2)
    print(f"\n💾 Saved raw data to {LATEST_STATS_PATH}")
    
    # ---------- Update constants.ts ----------
    update_constants_ts(stats, standings, has_fbref_data)
    
    # Calculate participant standings
    print("\n🏆 Calculating bet standings...")
    wins = calculate_standings(stats, standings)
    
    formatted_timestamp = ""
    if os.path.exists(CONSTANTS_PATH):
        with open(CONSTANTS_PATH, 'r') as f:
            content = f.read()

        # Update timestamp
        content = update_last_updated(content)

        # Capture the formatted timestamp for Supabase
        from datetime import timezone, timedelta
        est = timezone(timedelta(hours=-5))
        now_est = datetime.now(est)
        try:
            formatted_timestamp = now_est.strftime('%a %b %d, %-I:%M %p EST')
        except ValueError:
            formatted_timestamp = now_est.strftime('%a %b %d, %I:%M %p EST')

        # Update league history
        content = update_league_history(content, wins)

        with open(CONSTANTS_PATH, 'w') as f:
            f.write(content)
        print("   ✅ constants.ts updated!")

    # ── Push to Supabase (when credentials are configured) ──
    push_to_supabase(stats, standings, wins, formatted_timestamp, has_fbref_data)

    print("\n" + "=" * 60)
    print("✅ Done!")
    print("=" * 60)


if __name__ == "__main__":
    main()
