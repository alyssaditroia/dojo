
**Total Solves & Users using Distinct**
```
EXPLAIN ANALYZE           
SELECT 
COUNT(DISTINCT s.user_id) as total_users,
COUNT(*) as total_solves
FROM submissions s
INNER JOIN dojo_challenges dc ON dc.challenge_id = s.challenge_id
INNER JOIN challenges c ON c.id = s.challenge_id
INNER JOIN users u ON u.id = s.user_id
WHERE s.type = 'correct'
AND dc.dojo_id = 1285760730
AND c.state = 'visible'
AND u.type != 'admin'
AND u.hidden = false;
```
***No Index***
- Execution Time: 492.460 ms
- Execution Time: 420.089 ms
- Execution Time: 411.631 ms

***Most Useful Indexes Added***
- Execution Time: 272.466 ms
-  Execution Time: 283.114 ms


***Total Solves & Users Using Group By***

```
EXPLAIN ANALYZE
SELECT 
    COUNT(*) AS total_users,
    SUM(total_user_solves) AS total_solves
FROM (
    SELECT 
        s.user_id,
        COUNT(*) AS total_user_solves
    FROM submissions s
    INNER JOIN dojo_challenges dc ON dc.challenge_id = s.challenge_id
    INNER JOIN challenges c ON c.id = s.challenge_id
    INNER JOIN users u ON u.id = s.user_id
    WHERE s.type = 'correct'
      AND dc.dojo_id = 1285760730
      AND c.state = 'visible'
      AND u.type != 'admin'
      AND u.hidden = false
    GROUP BY s.user_id
) t;
```
***No Index***
-  Execution Time: 141.676 ms
-  Execution Time: 140.768 ms
-  Execution Time: 137.687 ms

***Most Useful Indexes Added***
-  Execution Time: 125.814 ms


**Recent Solves**

```
EXPLAIN ANALYZE
WITH valid_challenges AS (
    SELECT dc.challenge_id, dc.name
    FROM dojo_challenges dc
    INNER JOIN challenges c ON c.id = dc.challenge_id
    WHERE dc.dojo_id = 1285760730
        AND c.state = 'visible'
)
SELECT s.date, vc.name
FROM submissions s
INNER JOIN valid_challenges vc ON vc.challenge_id = s.challenge_id
WHERE s.type = 'correct'
    AND s.user_id IN (
        SELECT id FROM users 
        WHERE type != 'admin' AND hidden = false
    )
    AND s.date >= NOW() - INTERVAL '10 days'
ORDER BY s.date DESC
LIMIT 7;
```
***Without Index***
-  Execution Time: 100.309 ms
-  Execution Time: 104.847 ms
-  Execution Time: 100.744 ms

***Most Useful Indexes Added***
-  Execution Time: 0.314 ms
-   Execution Time: 0.384 ms
-  Execution Time: 0.469 ms

**Most Useful Indexes**
```
CREATE INDEX CONCURRENTLY idx_submissions_type_challenge_user 
ON submissions(challenge_id, user_id) 
WHERE type = 'correct';

CREATE INDEX idx_submissions_date_desc ON submissions (date DESC);

```
**Update Postgres Stats**
```
VACUUM ANALYZE submissions;
VACUUM ANALYZE dojo_challenges;
VACUUM ANALYZE challenges;
VACUUM ANALYZE users;
VACUUM ANALYZE dojos;

ANALYZE submissions;
ANALYZE dojo_challenges;
ANALYZE challenges;
ANALYZE users;
ANALYZE dojos;
```
**Observe Index Usage For All Indexes**
```
SELECT 
schemaname,
relname as tablename,
indexrelname as indexname,
idx_scan as scans,
idx_tup_read as tuples_read,
idx_tup_fetch as tuples_fetched,
pg_size_pretty(pg_relation_size(indexrelid)) as size,
pg_size_pretty(pg_total_relation_size(indexrelid)) as total_size,
CASE 
WHEN idx_scan = 0 THEN 'UNUSED'
WHEN idx_scan < 100 THEN 'LOW'
ELSE 'ACTIVE'
END as usage_status,
pg_get_indexdef(indexrelid) as definition
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC, pg_relation_size(indexrelid) DESC;
```

**Other Indexes (didn't seem to help locally)**
```
CREATE INDEX CONCURRENTLY idx_dojo_challenges_dojo_challenge 
ON dojo_challenges(dojo_id, challenge_id);

CREATE INDEX CONCURRENTLY idx_users_active 
ON users(id) 
WHERE type != 'admin' AND hidden = false;
```

**Drop Indexes (used for isolated index testing)**
```
DROP INDEX CONCURRENTLY IF EXISTS idx_submissions_type_challenge_user;
DROP INDEX CONCURRENTLY IF EXISTS idx_dojo_challenges_dojo_challenge;
DROP INDEX CONCURRENTLY IF EXISTS idx_users_active;
DROP INDEX CONCURRENTLY IF EXISTS idx_submissions_date_desc;
```

**Materialized View**
```
CREATE MATERIALIZED VIEW dojo_solve_summary AS
WITH challenge_counts AS (
    SELECT
        dc.dojo_id,
        COUNT(*) AS total_challenges
    FROM dojo_challenges dc
    JOIN challenges c
      ON c.id = dc.challenge_id
    WHERE
        dc.required = TRUE
        AND c.state = 'visible'
    GROUP BY dc.dojo_id
),
solve_stats AS (
    SELECT
        dc.dojo_id,
        COUNT(DISTINCT s.user_id) AS total_users,
        COUNT(*)                  AS total_solves
    FROM submissions s
    JOIN dojo_challenges dc
      ON dc.challenge_id = s.challenge_id
    JOIN dojo_modules dm
      ON dm.dojo_id      = dc.dojo_id
     AND dm.module_index = dc.module_index
    LEFT JOIN dojo_users du
      ON du.user_id = s.user_id
     AND du.dojo_id = dc.dojo_id
    JOIN dojos d
      ON d.dojo_id = dc.dojo_id
     AND (
            d.official
         OR d.data->>'type' = 'public'
         OR du.user_id IS NOT NULL
         )
    JOIN users u
      ON u.id = s.user_id
    LEFT JOIN dojo_challenge_visibilities dcv
      ON dcv.dojo_id        = dc.dojo_id
     AND dcv.module_index   = dc.module_index
     AND dcv.challenge_index = dc.challenge_index
    JOIN challenges c
      ON c.id = s.challenge_id
    WHERE
        s.type = 'correct'
        AND (dcv.start IS NULL OR s.date >= dcv.start)
        AND (dcv.stop  IS NULL OR s.date <= dcv.stop)
        AND NOT u.hidden
        AND (du.type IS NULL OR du.type <> 'admin')
        AND dc.required = TRUE
        AND c.state = 'visible'
    GROUP BY dc.dojo_id
)
SELECT
    cc.dojo_id,
    COALESCE(ss.total_users,  0) AS total_users,
    COALESCE(ss.total_solves, 0) AS total_solves,
    cc.total_challenges
FROM challenge_counts cc
LEFT JOIN solve_stats ss
  ON ss.dojo_id = cc.dojo_id;
```
**Create Materialized View Index**
```
CREATE UNIQUE INDEX dojo_solve_summary_pkey
ON dojo_solve_summary (dojo_id);
```
**Refresh**
```
REFRESH MATERIALIZED VIEW CONCURRENTLY dojo_solve_summary;
```

**New Query**
```
SELECT total_users, total_solves, total_challenges
FROM dojo_solve_summary
WHERE dojo_id = :dojo_id;
```