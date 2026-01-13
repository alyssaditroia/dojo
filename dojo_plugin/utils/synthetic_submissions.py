from CTFd.models import db, Challenges, Users, Solves
from datetime import datetime, timedelta

NUM_USERS = 6000
BATCH     = 300
PREFIX    = "test-user-new"
MAX_DAYS  = 90

chals = Challenges.query.order_by(Challenges.id.asc()).all()
total = len(chals)
now = datetime.now()

solves_to_insert = []

for i in range(NUM_USERS):
    is_hidden = (i % 100 == 0)
    is_admin = (i % 500 == 0)
    
    u = Users(
        name=f"{PREFIX}-{i}",
        email=f"{PREFIX}-{i}@email.com",
        hidden=is_hidden,
        type="admin" if is_admin else "user"
    )
    db.session.add(u)
    
    pct = (abs(hash(f"{i}-seed-42")) % 100) / 100.0
    k = int(pct * total)
    
    if k > 0:
        for j in range(k):
            days_ago = abs(hash(f"solve-{i}-{j}")) % MAX_DAYS
            solve_time = now - timedelta(days=days_ago)
            chal_idx = abs(hash(f"chal-{i}-{j}")) % total
            
            solves_to_insert.append((solve_time, u, chals[chal_idx]))

db.session.commit()
print(f"Created {NUM_USERS} users")

solves_to_insert.sort(key=lambda x: x[0])

for idx, (solve_time, user, challenge) in enumerate(solves_to_insert):
    db.session.add(Solves(challenge=challenge, user=user, date=solve_time))
    
    if (idx + 1) % BATCH == 0:
        db.session.commit()
        print(f"Committed {idx + 1} solves")

db.session.commit()
print(f"Done. Created {len(solves_to_insert)} solves dated within the last {MAX_DAYS} days.")
