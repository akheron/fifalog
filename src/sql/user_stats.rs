use crate::db::Database;

#[derive(sqlx::FromRow)]
pub struct Row {
    pub month: String,
    pub user_name: String,
    pub win_count: i32,
    pub overtime_win_count: i32,
    pub goals_for: i32,
}

pub async fn user_stats(dbc: &Database, limit: i32) -> Result<Vec<Row>, sqlx::Error> {
    sqlx::query_as::<_, Row>(
        // language=SQL
        r#"
WITH result AS (
    SELECT
        finished_time,
        home_user_id AS user_id,
        home_score AS goals_for,
        finished_type <> 'penalties' AND home_score > away_score AS win,
        finished_type = 'overTime' AND home_score > away_score AS overtime_win
    FROM match
    WHERE
        finished_type IS NOT NULL AND
        finished_time IS NOT NULL AND
        home_score IS NOT NULL AND
        away_score IS NOT NULL
    UNION ALL
    SELECT
        finished_time,
        away_user_id AS user_id,
        away_score AS goals_for,
        finished_type <> 'penalties' AND away_score > home_score AS win,
        finished_type = 'overTime' AND away_score > home_score AS overtime_win
    FROM match
    WHERE
        finished_type IS NOT NULL AND
        finished_time IS NOT NULL AND
        home_score IS NOT NULL AND
        away_score IS NOT NULL
    ORDER BY finished_time DESC
    LIMIT CASE
        WHEN $1 = 0 THEN NULL
        ELSE $1 * 2
    END
)
SELECT
    CASE
        WHEN $1 = 0
        THEN to_char(result.finished_time, 'YYYY-MM')
        ELSE 'Last ' || $1
    END AS month,
    "user".name AS user_name,
    sum(result.win::integer)::integer as win_count,
    sum(result.overtime_win::integer)::integer as overtime_win_count,
    sum(result.goals_for::integer)::integer as goals_for
FROM "user"
JOIN result ON (result.user_id = "user".id)
GROUP BY month, "user".id, "user".name
ORDER BY month DESC, win_count ASC
"#,
    )
    .bind(limit)
    .fetch_all(dbc)
    .await
}
