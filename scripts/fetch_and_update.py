#!/usr/bin/env python3
"""
Automated stats fetcher for GitHub Actions CI.
Fetches stats from FBref/FotMob and updates constants.ts directly.

Usage:
    python3 scripts/fetch_and_update.py
"""

import json
import re
import os
from datetime import datetime
import warnings
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

# Players whose bets cover EPL + FA Cup + Carabao Cup (not EPL-only)
CUP_BET_PLAYERS = ["zirkzee", "madueke", "cherki"]

# Candidate slugs to probe for each cup competition.
# ESPN's slug conventions vary; we probe all candidates and use the first that works.
# Website evidence: espn.com/soccer/.../league/eng.fa and .../eng.efl_cup
ESPN_CUP_SLUG_CANDIDATES = {
    "FA Cup":      ["eng.fa", "eng.fa_cup", "eng.facup"],
    "Carabao Cup": ["eng.efl_cup", "eng.league_cup", "eng.carabao"],
}

# API base paths to try. The scoreboard/summary endpoints sit under site/v2,
# while standings sit under v2 — cup scoreboards may need the site/v2 path.
ESPN_API_BASES = [
    "https://site.api.espn.com/apis/site/v2/sports/soccer",
    "https://site.api.espn.com/apis/v2/sports/soccer",
]

# Team name fragments used to filter cup matches to only those involving
# the players we track (Zirkzee → Man Utd, Madueke → Arsenal, Cherki → Man City).
ESPN_RELEVANT_TEAMS = [
    "manchester united", "man united", "man utd",
    "arsenal",
    "manchester city", "man city",
]

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


def get_player_stats_understat():
    """Fetch player goals + assists from understat.com (not datacenter-blocked)."""
    import asyncio
    import aiohttp
    from understat import Understat

    print("🔄 Fetching player stats via understat.com...")
    sys.stdout.flush()

    # understat uses the season start year (2025 for 2025-26)
    season_year = int(SEASON.split("-")[0])

    async def _fetch():
        async with aiohttp.ClientSession() as session:
            u = Understat(session)
            return await u.get_league_players("epl", season_year)

    try:
        players = asyncio.run(_fetch())
        results = {}

        for key, info in PLAYERS.items():
            found = False
            for search_term in info["search"]:
                for p in players:
                    pname = p.get("player_name", "")
                    if search_term.lower() in pname.lower() or pname.lower() in search_term.lower():
                        goals = int(p.get("goals", 0) or 0)
                        assists = int(p.get("assists", 0) or 0)
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
                if found:
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

    except Exception as e:
        print(f"   ❌ Understat error: {e}")
        sys.stdout.flush()

    return {}


def _probe_espn_cup_endpoint(cup_name, slug_candidates):
    """
    Probe ESPN API base paths × slug candidates to find a working scoreboard URL.
    Returns (base_url, slug) of the first combination that returns HTTP 200, or None.
    """
    import requests

    headers = {"User-Agent": "Mozilla/5.0"}
    for slug in slug_candidates:
        for base in ESPN_API_BASES:
            url = f"{base}/{slug}/scoreboard"
            try:
                r = requests.get(url, params={"limit": 1}, timeout=8, headers=headers)
                if r.ok:
                    print(f"   [{cup_name}] Working endpoint: {base}/{slug}/scoreboard")
                    sys.stdout.flush()
                    return base, slug
            except Exception:
                pass
    print(f"   ❌ [{cup_name}] No working ESPN endpoint found (tried slugs: {slug_candidates})")
    sys.stdout.flush()
    return None


def get_cup_stats_espn(players_to_find):
    """
    Fetch FA Cup + Carabao Cup goals/assists using ESPN's public match API.

    ESPN's public API works from datacenter IPs (same as the standings endpoint
    we already use) — unlike FBref, which blocks cloud/CI IP ranges with 403.

    Strategy:
      1. Probe multiple ESPN slug/path combinations to find a working scoreboard
         endpoint for each cup (ESPN's slugs and API paths vary by competition).
      2. Fetch completed season matches, filtering to those involving Man Utd,
         Arsenal, or Man City to keep API call counts low.
      3. For each relevant match, fetch the detailed summary and extract
         goal scorers and assisters from `scoringPlays`.
      4. Aggregate across both cups and return combined totals.

    Returns {player_key: {"goals": int, "assists": int}} or {} on failure.
    """
    import requests
    import time

    print("\n🏆 Fetching cup stats via ESPN match summaries (FA Cup + Carabao Cup)...")
    sys.stdout.flush()

    SEASON_DATES = "20250701-20260701"
    API_HEADERS  = {"User-Agent": "Mozilla/5.0"}

    combined = {}  # {player_key: {"goals": int, "assists": int}}

    for cup_name, slug_candidates in ESPN_CUP_SLUG_CANDIDATES.items():
        print(f"\n   [{cup_name}] Probing ESPN endpoints...")
        sys.stdout.flush()

        # ── 1. Discover working endpoint ────────────────────────
        result = _probe_espn_cup_endpoint(cup_name, slug_candidates)
        if result is None:
            continue
        api_base, slug = result

        # ── 2. Fetch full season scoreboard ─────────────────────
        try:
            resp = requests.get(
                f"{api_base}/{slug}/scoreboard",
                params={"dates": SEASON_DATES, "limit": 300},
                timeout=15,
                headers=API_HEADERS,
            )
            resp.raise_for_status()
            events = resp.json().get("events", [])
        except Exception as e:
            print(f"   ❌ [{cup_name}] Season scoreboard fetch failed: {e}")
            sys.stdout.flush()
            continue

        print(f"   [{cup_name}] {len(events)} total events returned")
        sys.stdout.flush()

        # ── 3. Filter to completed matches involving our teams ───
        relevant_ids = []
        for event in events:
            comps = event.get("competitions", [])
            if not comps:
                continue
            comp = comps[0]
            if not comp.get("status", {}).get("type", {}).get("completed", False):
                continue
            for competitor in comp.get("competitors", []):
                team_name = competitor.get("team", {}).get("displayName", "").lower()
                if any(alias in team_name for alias in ESPN_RELEVANT_TEAMS):
                    relevant_ids.append(event["id"])
                    break

        print(f"   [{cup_name}] {len(relevant_ids)} relevant completed matches")
        sys.stdout.flush()

        # ── 4. Fetch each match summary and extract per-player stats ─
        # ESPN soccer summaries carry player stats in boxscore.players, not in
        # scoringPlays.participants (that structure is used for American sports).
        for event_id in relevant_ids:
            time.sleep(0.3)  # gentle rate limiting
            try:
                resp = requests.get(
                    f"{api_base}/{slug}/summary",
                    params={"event": event_id},
                    timeout=15,
                    headers=API_HEADERS,
                )
                resp.raise_for_status()
                summary = resp.json()
            except Exception as e:
                print(f"   ⚠️  [{cup_name}] Event {event_id} summary failed: {e}")
                sys.stdout.flush()
                continue

            # boxscore.players → list of team entries, each with statistics groups
            # Each statistics group has "names" (column headers) and "athletes" (rows)
            # Typical soccer columns include "G" (goals) and "A" (assists)
            for team_entry in summary.get("boxscore", {}).get("players", []):
                for stat_group in team_entry.get("statistics", []):
                    names = stat_group.get("names", [])

                    # Find column indices for goals and assists
                    # ESPN uses "G"/"A" but handle possible label variations
                    g_idx = next(
                        (i for i, n in enumerate(names) if n.upper() in ("G", "GLS", "GOALS")),
                        None,
                    )
                    a_idx = next(
                        (i for i, n in enumerate(names) if n.upper() in ("A", "AST", "ASSISTS")),
                        None,
                    )

                    if g_idx is None and a_idx is None:
                        continue

                    for athlete_entry in stat_group.get("athletes", []):
                        athlete_name = athlete_entry.get("athlete", {}).get("displayName", "")
                        stats        = athlete_entry.get("stats", [])

                        for key, info in players_to_find.items():
                            for search_term in info["search"]:
                                if search_term.lower() in athlete_name.lower():
                                    if key not in combined:
                                        combined[key] = {"goals": 0, "assists": 0}
                                    try:
                                        if g_idx is not None and g_idx < len(stats):
                                            combined[key]["goals"] += int(float(stats[g_idx] or 0))
                                    except (ValueError, TypeError):
                                        pass
                                    try:
                                        if a_idx is not None and a_idx < len(stats):
                                            combined[key]["assists"] += int(float(stats[a_idx] or 0))
                                    except (ValueError, TypeError):
                                        pass
                                    break  # matched this player, move to next athlete

    # ── 5. Summary ───────────────────────────────────────────────
    found_any = False
    for key, data in combined.items():
        if data["goals"] or data["assists"]:
            g, a = data["goals"], data["assists"]
            print(f"   ✅ {PLAYERS[key]['name']}: {g}G {a}A in cups (FA Cup + Carabao Cup)")
            sys.stdout.flush()
            found_any = True

    if combined and not found_any:
        print("   — Cup-bet players found in data but 0 G/A in cups so far this season")
    elif not combined:
        print("   ⚠️  No cup stats retrieved — bet_02/bet_03 will show EPL-only totals")
    sys.stdout.flush()

    return combined


def get_standings_espn():
    """Fetch EPL standings from ESPN's public API (no auth, not datacenter-blocked)."""
    import requests

    print("\n🔄 Fetching EPL standings via ESPN API...")
    sys.stdout.flush()

    url = "https://site.api.espn.com/apis/v2/sports/soccer/eng.1/standings"
    standings = {}

    try:
        resp = requests.get(url, timeout=15, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        data = resp.json()

        # Walk the response: top-level or nested under 'children'
        groups = data.get("children", [data])
        entries = []
        for group in groups:
            entries.extend(group.get("standings", {}).get("entries", []))
        if not entries:
            entries = data.get("standings", {}).get("entries", [])

        for entry in entries:
            team_name = entry.get("team", {}).get("displayName", "").lower()
            rank = None
            pts = None
            for stat in entry.get("stats", []):
                name = stat.get("name", "")
                if name == "rank":
                    rank = int(stat.get("value", 0))
                elif name == "points":
                    pts = int(stat.get("value", 0))

            for canonical, aliases in TEAMS_TO_FIND.items():
                if any(alias in team_name for alias in aliases):
                    standings[canonical] = {"position": rank or 0, "points": pts or 0}
                    print(f"   ✅ {canonical}: Position {rank} ({pts} pts)")
                    break

    except Exception as e:
        print(f"   ❌ ESPN API error: {e}")
        sys.stdout.flush()

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
    print("📚 Sources: understat.com (EPL) + ESPN match summaries (cups) + ESPN API (standings)")
    print(f"📅 Season: {SEASON}")
    print(f"🕐 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📂 Project root: {PROJECT_ROOT}")
    print(f"🤖 CI mode: {IS_CI}")
    print("=" * 60)
    sys.stdout.flush()

    # ---------- Fetch EPL player stats ----------
    stats = get_player_stats_understat()

    # ---------- Fetch cup stats (FA Cup + Carabao Cup) ----------
    # Only needed for bet_02 (Zirkzee vs Madueke) and bet_03 (Zirkzee vs Cherki)
    # whose criteria explicitly count G/A across all three competitions.
    cup_players = {k: PLAYERS[k] for k in CUP_BET_PLAYERS if k in PLAYERS}
    cup_stats = get_cup_stats_espn(cup_players)

    # Merge cup G/A into the EPL stats for the three affected players so that
    # all downstream logic (update_constants_ts, calculate_standings, Supabase)
    # automatically uses the correct all-competition totals.
    if cup_stats and stats:
        print("\n➕ Merging cup stats into EPL totals for bet_02/bet_03 players...")
        for key in CUP_BET_PLAYERS:
            if key in stats and key in cup_stats:
                cup_g = cup_stats[key].get("goals", 0)
                cup_a = cup_stats[key].get("assists", 0)
                if cup_g or cup_a:
                    stats[key]["cup_goals"]   = cup_g
                    stats[key]["cup_assists"]  = cup_a
                    stats[key]["goals"]   += cup_g
                    stats[key]["assists"] += cup_a
                    stats[key]["g_a"]      = stats[key]["goals"] + stats[key]["assists"]
                    print(
                        f"   {PLAYERS[key]['name']}: +{cup_g}G +{cup_a}A from cups"
                        f" → {stats[key]['g_a']} G/A total (EPL + FA Cup + Carabao Cup)"
                    )
        sys.stdout.flush()

    # ---------- Fetch standings ----------
    standings = get_standings_espn()

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
        "sources": ["understat.com (EPL)", "ESPN match summaries (FA Cup + Carabao Cup)", "ESPN API (standings)"],
        "notes": {
            "bet_02_03": "G/A totals for Zirkzee/Madueke/Cherki include EPL + FA Cup + Carabao Cup",
            "cup_stats_source": "ESPN match summaries — falls back to EPL-only if ESPN cup endpoints unavailable",
        },
        "players": stats,
        "cup_stats_raw": cup_stats,
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
