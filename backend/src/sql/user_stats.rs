use crate::db::Database;
use crate::sql::sql_types::UserId;

pub struct Row(tokio_postgres::Row);

impl Row {
    pub fn month(&self) -> String {
        self.0.get(0)
    }
    pub fn user_id(&self) -> UserId {
        self.0.get(1)
    }
    pub fn user_name(&self) -> String {
        self.0.get(2)
    }
    pub fn win_count(&self) -> i32 {
        self.0.get(3)
    }
    pub fn overtime_win_count(&self) -> i32 {
        self.0.get(4)
    }
    pub fn goals_for(&self) -> i32 {
        self.0.get(5)
    }
}

pub async fn user_stats(dbc: &Database, limit: i32) -> Result<Vec<Row>, tokio_postgres::Error> {
    Ok(dbc
        .query(
            "user_stats",
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
    "user".id AS user_id,
    "user".name AS user_name,
    sum(result.win::integer)::integer as win_count,
    sum(result.overtime_win::integer)::integer as overtime_win_count,
    sum(result.goals_for::integer)::integer as goals_for
FROM "user"
JOIN result ON (result.user_id = "user".id)
GROUP BY month, "user".id, "user".name
ORDER BY month DESC, win_count ASC
"#,
            &[&limit],
        )
        .await?
        .into_iter()
        .map(Row)
        .collect())
}
