from CTFd.cache import cache
from CTFd.models import Solves
from datetime import datetime, timedelta
from sqlalchemy import func, desc, text
from CTFd import db

from . import get_all_containers, DojoChallenges
from .background_stats import get_cached_stat

CACHE_KEY_CONTAINERS = "stats:containers"

def calculate_container_stats():
    containers = get_all_containers()
    return [{attr: container.labels.get(f"dojo.{attr}_id")
            for attr in ["dojo", "module", "challenge"]}
            for container in containers]

def get_container_stats():
    cached = get_cached_stat(CACHE_KEY_CONTAINERS)
    if cached:
        return cached
    return []

def calculate_dojo_stats(dojo):
    now = datetime.now()
    solves_query = dojo.solves()

    total_challenges = len(dojo.challenges)
    visible_challenges = sum(1 for c in dojo.challenges if c.visible())

    # stats = db.session.execute(
    #     text("""
    #         SELECT 
    #             COUNT(DISTINCT user_id) as total_users,
    #             COUNT(*) as total_solves
    #         FROM submissions
    #         WHERE type = 'correct'
    #             AND challenge_id = ANY(:challenge_ids)
    #     """),
    start_time = datetime.now()
    stats = db.session.execute(
        text("""
            SELECT 
            total_users,
            total_solves,
            total_challenges
        FROM dojo_solve_summary
        WHERE dojo_id = :dojo_id
        """),
        {"challenge_ids": challenge_ids}
    ).fetchone()

    recent = db.session.execute(
        text("""
            SELECT s.date, dc.name
            FROM submissions s
            INNER JOIN dojo_challenges dc ON dc.challenge_id = s.challenge_id
            WHERE s.type = 'correct'
                AND dc.dojo_id = :dojo_id
            ORDER BY s.date DESC
            LIMIT 7
        """),
        {"dojo_id": dojo.dojo_id}
    ).fetchall()

    recent_solves = [
        {
            'challenge_name': row.name,
            'date': row.date,
            'date_display': row.date.strftime('%m/%d/%y %I:%M %p') if row.date else 'Unknown time'
        }
        for row in recent
    ]

    return {
        'users': stats.total_users or 0,
        'challenges': dojo.challenges_count,
        'solves': stats.total_solves or 0,
        'recent_solves': recent_solves,
        'active': 0,
        'calculation_time': (datetime.now() - start_time).total_seconds()

    }

def get_dojo_stats(dojo):
    cache_key = f"stats:dojo:{dojo.reference_id}"
    cached = get_cached_stat(cache_key)
    if cached:
        for solve in cached.get('recent_solves', []):
            if solve.get('date') and isinstance(solve['date'], str):
                solve['date'] = datetime.fromisoformat(solve['date'])
        return cached

    return {
        'users': total_users,
        'challenges': total_challenges,
        'visible_challenges': visible_challenges,
        'solves': total_solves,
        'recent_solves': recent_solves,
        'active': 0,
        'calculation_time': (datetime.now() - start_time).total_seconds()

    }
