## Main stats query (total solves and users)
```
EXPLAIN ANALYZE
SELECT 
    COUNT(DISTINCT s.user_id) as total_users,
    COUNT(s.id) as total_solves
FROM submissions s
INNER JOIN dojo_challenges dc ON dc.challenge_id = s.challenge_id
WHERE s.type = 'correct'
    AND dc.dojo_id = -3776755;
```

 Planning Time: 0.792 ms
 JIT:
   Functions: 17
   Options: Inlining false, Optimization false, Expressions true, Deforming true
   Timing: Generation 3.215 ms (Deform 1.461 ms), Inlining 0.000 ms, Optimization 1.791 ms, Emission 15.819 ms, Total 20.825 ms
 Execution Time: 478.711 ms
(19 rows)

## Recent solves query

```
EXPLAIN ANALYZE
SELECT s.date, dc.name
FROM submissions s
INNER JOIN dojo_challenges dc ON dc.challenge_id = s.challenge_id
WHERE s.type = 'correct'
    AND dc.dojo_id = -3776755
ORDER BY s.date DESC
LIMIT 10;
```

 Planning Time: 1.503 ms
 Execution Time: 162.680 ms
(20 rows)

## Challenge count query

```
EXPLAIN ANALYZE
SELECT COUNT(*) as total_challenges
FROM dojo_challenges
WHERE dojo_id = -3776755;
```

 Aggregate  (cost=49.86..49.87 rows=1 width=8) (actual time=0.352..0.353 rows=1 loops=1)
   ->  Seq Scan on dojo_challenges  (cost=0.00..49.54 rows=127 width=0) (actual time=0.119..0.335 rows=127 loops=1)
         Filter: (dojo_id = '-3776755'::integer)
         Rows Removed by Filter: 243
 Planning Time: 0.488 ms
 Execution Time: 0.495 ms
(6 rows)

## Full dojo.solves() query with all joins

```
EXPLAIN ANALYZE
SELECT COUNT(DISTINCT s.user_id), COUNT(s.id)
FROM submissions s
JOIN dojo_challenges dc ON dc.challenge_id = s.challenge_id
JOIN dojo_modules dm ON dm.dojo_id = dc.dojo_id AND dm.module_index = dc.module_index
LEFT JOIN dojo_users du ON du.user_id = s.user_id AND du.dojo_id = dc.dojo_id
JOIN dojos d ON d.dojo_id = dc.dojo_id AND (d.official OR d.data->>'type' = 'public' OR du.user_id IS NOT NULL)
JOIN users u ON u.id = s.user_id
WHERE s.type = 'correct'
    AND dc.dojo_id = -3776755
    AND (du.type IS NULL OR du.type != 'admin');
```

 Planning Time: 4.734 ms
 JIT:
   Functions: 42
   Options: Inlining false, Optimization false, Expressions true, Deforming true
   Timing: Generation 2.830 ms (Deform 1.172 ms), Inlining 0.000 ms, Optimization 2.054 ms, Emission 19.578 ms, Total 24.462 ms
 Execution Time: 608.826 ms
(38 rows)


## Check index usage on submissions table
```
EXPLAIN ANALYZE
SELECT s.challenge_id, s.date, s.user_id
FROM submissions s
WHERE s.type = 'correct'
    AND s.challenge_id IN (SELECT challenge_id FROM dojo_challenges WHERE dojo_id = -3776755)
ORDER BY s.date DESC
LIMIT 10;
```
 Planning Time: 0.743 ms
 Execution Time: 129.881 ms
(20 rows)

## Visibility check query
```
EXPLAIN ANALYZE
SELECT s.id
FROM submissions s
JOIN dojo_challenges dc ON dc.challenge_id = s.challenge_id
LEFT JOIN dojo_challenge_visibilities dcv ON 
    dcv.dojo_id = dc.dojo_id 
    AND dcv.module_index = dc.module_index 
    AND dcv.challenge_index = dc.challenge_index
WHERE s.type = 'correct'
    AND dc.dojo_id = -3776755
    AND (dcv.start IS NULL OR s.date >= dcv.start)
    AND (dcv.stop IS NULL OR s.date <= dcv.stop);
```
 Planning Time: 5.830 ms
 Execution Time: 149.208 ms
(23 rows)

## Check if indexes exist
```
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('submissions', 'dojo_challenges', 'dojo_challenge_visibilities')
ORDER BY tablename, indexname;
```
|          tablename          |                  indexname                  |                                                                    indexdef                                                                     |
|----------------------------|---------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| dojo_challenge_visibilities | dojo_challenge_visibilities_pkey            | CREATE UNIQUE INDEX dojo_challenge_visibilities_pkey ON public.dojo_challenge_visibilities USING btree (dojo_id, module_index, challenge_index) |
| dojo_challenge_visibilities | ix_dojo_challenge_visibilities_start        | CREATE INDEX ix_dojo_challenge_visibilities_start ON public.dojo_challenge_visibilities USING btree (start)                                     |
| dojo_challenge_visibilities | ix_dojo_challenge_visibilities_stop         | CREATE INDEX ix_dojo_challenge_visibilities_stop ON public.dojo_challenge_visibilities USING btree (stop)                                       |
| dojo_challenges             | dojo_challenges_dojo_id_module_index_id_key | CREATE UNIQUE INDEX dojo_challenges_dojo_id_module_index_id_key ON public.dojo_challenges USING btree (dojo_id, module_index, id)              |
| dojo_challenges             | dojo_challenges_pkey                        | CREATE UNIQUE INDEX dojo_challenges_pkey ON public.dojo_challenges USING btree (dojo_id, module_index, challenge_index)                        |
| dojo_challenges             | ix_dojo_challenges_challenge_id             | CREATE INDEX ix_dojo_challenges_challenge_id ON public.dojo_challenges USING btree (challenge_id)                                              |
| dojo_challenges             | ix_dojo_challenges_id                       | CREATE INDEX ix_dojo_challenges_id ON public.dojo_challenges USING btree (id)                                                                  |
| submissions                 | submissions_pkey                            | CREATE UNIQUE INDEX submissions_pkey ON public.submissions USING btree (id)                                                                    |


## Refresh Statistics
#### VACUUM
- Reclaims disk space from deleted/updated rows ("dead tuples")
- Updates visibility map for faster index-only scans
- Prevents transaction ID wraparound
- Does NOT block reads/writes (unless FULL is specified)
#### ANALYZE
- Collects table statistics (row counts, data distribution, null percentages)
- Updates query planner statistics in pg_statistic
- Helps PostgreSQL choose optimal query execution plans
- Critical after bulk inserts/updates/deletes

```
VACUUM ANALYZE submissions;
VACUUM ANALYZE dojo_challenges;
VACUUM ANALYZE dojos;
VACUUM ANALYZE users;
```

## Table statistics
```
SELECT 
    schemaname,
    relname as tablename,
    n_live_tup as row_count,
    n_dead_tup as dead_rows,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE relname IN ('submissions', 'dojo_challenges', 'dojos', 'users')
ORDER BY n_live_tup DESC;
```
| schemaname |    tablename    | row_count | dead_rows |         last_vacuum          | last_autovacuum |         last_analyze          | last_autoanalyze |
|------------|-----------------|-----------|-----------|------------------------------|-----------------|------------------------------|------------------|
| public     | submissions     | 1984154   | 20000     | 2025-10-16 04:23:48.792023+00|                 | 2025-10-16 04:23:48.865518+00|                  |
| public     | users           | 6001      | 0         | 2025-10-16 04:25:18.396971+00|                 | 2025-10-16 04:25:18.42109+00 |                  |
| public     | dojo_challenges | 370       | 0         | 2025-10-16 04:24:17.728007+00|                 | 2025-10-16 04:24:17.740415+00|                  |
| public     | dojos           | 4         | 0         | 2025-10-16 04:24:41.866744+00|                 | 2025-10-16 04:24:41.872478+00|                  |


# Solution
### Add index

CREATE INDEX CONCURRENTLY submissions_challenge_type_idx 
ON submissions (challenge_id) 
WHERE type = 'correct';

CREATE INDEX CONCURRENTLY submissions_date_challenge_type_idx 
ON submissions (date DESC, challenge_id) 
WHERE type = 'correct';

CREATE INDEX CONCURRENTLY dojo_challenges_dojo_challenge_idx
ON dojo_challenges (dojo_id, challenge_id);

ANALYZE submissions;
ANALYZE dojo_challenges;

SELECT 
    calls,
    total_exec_time::numeric(10,2) as total_ms,
    mean_exec_time::numeric(10,2) as mean_ms,
    LEFT(query, 100) as query_preview
FROM pg_stat_statements
WHERE query ILIKE '%submissions%'
ORDER BY total_exec_time DESC
LIMIT 10;

## Monitor Index Usage
SELECT 
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

docker exec dojo docker logs ctfd 2>&1 | grep "Slow query" | grep "stats.py"