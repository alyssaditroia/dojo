from CTFd.cache import cache
from CTFd.models import Solves, db
from datetime import datetime, timedelta
from sqlalchemy import func, desc

from . import force_cache_updates, get_all_containers, DojoChallenges

@cache.memoize(timeout=1200, forced_update=force_cache_updates)
def get_container_stats():
    containers = get_all_containers()
    return [{attr: container.labels[f"dojo.{attr}_id"]
            for attr in ["dojo", "module", "challenge"]}
            for container in containers]

#@cache.memoize(timeout=1200, forced_update=force_cache_updates)
def get_dojo_stats(dojo):
    now = datetime.now()

    total_challenges = (
        db.session.query(func.count(DojoChallenges.challenge_id))
        .filter(DojoChallenges.dojo_id == dojo.dojo_id)
        .scalar()
    )

    total_stats = dojo.solves().with_entities(
        func.count(Solves.id).label('total_solves'),
        func.count(func.distinct(Solves.user_id)).label('total_users')
    ).first()

    total_solves = total_stats.total_solves or 0
    total_users = total_stats.total_users or 0

    recent_solves_query = (
        dojo.solves()
        .with_entities(
            Solves.date.label('date'),
            DojoChallenges.name.label('challenge_name')
        )
        .filter(Solves.date >= now - timedelta(days=7))
        .order_by(desc(Solves.date))
        .limit(5)
    )

    recent_solves = [
        {
            'challenge_name': f'{solve.challenge_name}',
            'date': solve.date,
            'date_display': solve.date.strftime('%m/%d/%y %I:%M %p') if solve.date else 'Unknown time'
        }
        for solve in recent_solves_query
    ]

    return {
        'users': total_users,
        'challenges': total_challenges,
        'solves': total_solves,
        'recent_solves': recent_solves,
    }