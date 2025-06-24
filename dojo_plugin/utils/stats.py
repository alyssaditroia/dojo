from CTFd.cache import cache
from CTFd.models import Solves
from datetime import datetime, timedelta
from sqlalchemy import func, desc, case

from . import force_cache_updates, get_all_containers, DojoChallenges

@cache.memoize(timeout=1200, forced_update=force_cache_updates)
def get_container_stats():
    containers = get_all_containers()
    return [{attr: container.labels[f"dojo.{attr}_id"]
            for attr in ["dojo", "module", "challenge"]}
            for container in containers]

@cache.memoize(timeout=600, forced_update=force_cache_updates)
def get_dojo_stats(dojo):
    """
    Optimized dojo statistics with single query aggregation.
    Uses conditional aggregation to minimize database round trips.
    """
    now = datetime.now()
    solves_query = dojo.solves()

    # Use separate cached function for challenge counts
    total_challenges, visible_challenges = get_dojo_challenge_counts(dojo)

    # Single query to get all time-based stats at once
    oldest_date = now - timedelta(days=60)
    
    # single query
    stats_query = solves_query.filter(Solves.date >= oldest_date).with_entities(
        # Total stats
        func.count(Solves.id).label('total_solves'),
        func.count(func.distinct(Solves.user_id)).label('total_users'),
        
        # Daily snapshots 
        func.sum(func.case(
            (func.date(Solves.date) == func.date(now - timedelta(days=1)), 1), else_=0
        )).label('today_solves'),
        func.count(func.distinct(func.case(
            (func.date(Solves.date) == func.date(now - timedelta(days=1)), Solves.user_id), else_=None
        ))).label('today_users'),
        
        func.sum(func.case(
            (func.date(Solves.date) == func.date(now - timedelta(days=7)), 1), else_=0
        )).label('week_solves'),
        func.count(func.distinct(func.case(
            (func.date(Solves.date) == func.date(now - timedelta(days=7)), Solves.user_id), else_=None
        ))).label('week_users'),
        
        func.sum(func.case(
            (func.date(Solves.date) == func.date(now - timedelta(days=30)), 1), else_=0
        )).label('month_solves'),
        func.count(func.distinct(func.case(
            (func.date(Solves.date) == func.date(now - timedelta(days=30)), Solves.user_id), else_=None
        ))).label('month_users'),
        
        func.sum(func.case(
            (func.date(Solves.date) == func.date(now - timedelta(days=60)), 1), else_=0
        )).label('two_months_solves'),
        func.count(func.distinct(func.case(
            (func.date(Solves.date) == func.date(now - timedelta(days=60)), Solves.user_id), else_=None
        ))).label('two_months_users')
    ).first()

    total_solves = stats_query.total_solves or 0
    total_users = stats_query.total_users or 0
    
    # Extract chart data from single query result
    chart_solves = [
        stats_query.today_solves or 0,
        stats_query.week_solves or 0,
        stats_query.month_solves or 0,
        stats_query.two_months_solves or 0
    ]
    chart_users = [
        stats_query.today_users or 0,
        stats_query.week_users or 0,
        stats_query.month_users or 0,
        stats_query.two_months_users or 0
    ]
    
    chart_labels = ['Today', '1w ago', '1mo ago', '2mo ago']

    # Separate query for recent solves with join
    recent_solves_query = (
        solves_query
        .with_entities(
            Solves.date,
            DojoChallenges.name.label('challenge_name')
        )
        .filter(Solves.date >= now - timedelta(days=7))
        .order_by(desc(Solves.date))
        .limit(5)
        .all()
    )

    recent_solves = [
        {
            'challenge_name': f'{solve.challenge_name}',
            'date': solve.date,
            'date_display': solve.date.strftime('%m/%d/%y %I:%M %p') if solve.date else 'Unknown time'
        }
        for solve in recent_solves_query
    ]

    def trend_calc(current, previous):
        if previous == 0:
            return 100 if current > 0 else 0
        change = ((current - previous) / previous) * 100
        return max(-99, min(999, round(change)))

    trends = {
        'solves': trend_calc(chart_solves[0], chart_solves[1]),
        'users': trend_calc(chart_users[0], chart_users[1]),
        'active': 0,
        'challenges': 0,
    }

    return {
        'users': total_users,
        'challenges': total_challenges,
        'visible_challenges': visible_challenges,
        'solves': total_solves,
        'recent_solves': recent_solves,
        'trends': trends,
        'chart_data': {
            'labels': chart_labels,
            'solves': chart_solves,
            'users': chart_users
        }
    }

@cache.memoize(timeout=3600, forced_update=force_cache_updates)
def get_dojo_challenge_counts(dojo):
    """
    Separate function to cache challenge counts since they change less frequently.
    """
    total_challenges = len(dojo.challenges)
    visible_challenges = len([c for c in dojo.challenges if c.visible()])
    return total_challenges, visible_challenges

