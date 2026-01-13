from CTFd.models import db, Users, Solves

def remove_synthetic_users(prefix="synthetic", batch_size=200):
    total_deleted = 0
    
    while True:
        users_to_delete = Users.query.filter(
            Users.name.like(f"{prefix}-%")
        ).limit(batch_size).all()
        
        if not users_to_delete:
            break
            
        user_ids = [u.id for u in users_to_delete]
        
        solve_count = Solves.query.filter(Solves.user_id.in_(user_ids)).count()
        Solves.query.filter(Solves.user_id.in_(user_ids)).delete(synchronize_session=False)
        Users.query.filter(Users.id.in_(user_ids)).delete(synchronize_session=False)
        db.session.commit()
        
        total_deleted += len(user_ids)
        print(f"Deleted batch: {len(user_ids)} users, {solve_count} solves (total users: {total_deleted})")
        
    print(f"Deletion complete: {total_deleted} users removed")
    return total_deleted

"""
from CTFd.plugins.dojo_plugin.utils.remove  import remove_synthetic_users
count = remove_synthetic_users()
print(f"Deleted {count} users")

"""