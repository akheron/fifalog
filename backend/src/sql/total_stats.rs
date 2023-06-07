use crate::db::Database;

pub struct Row(tokio_postgres::Row);

impl Row {
    pub fn month(&self) -> String {
        self.0.get(0)
    }
    pub fn match_count(&self) -> i32 {
        self.0.get(1)
    }
    pub fn tie_count(&self) -> i32 {
        self.0.get(2)
    }
    pub fn goal_count(&self) -> i32 {
        self.0.get(3)
    }
}

pub async fn total_stats(dbc: &Database, limit: i32) -> Result<Vec<Row>, tokio_postgres::Error> {
    Ok(dbc
        .query(
            "total_stats",
            r#"
WITH result AS (
    SELECT
        id,
        finished_time,
        home_score = away_score OR finished_type = 'penalties' AS tie,
        home_score + away_score AS goal_count
    FROM match
    WHERE
        finished_type IS NOT NULL AND
        finished_time IS NOT NULL AND
        home_score IS NOT NULL AND
        away_score IS NOT NULL
    ORDER BY finished_time DESC
    LIMIT CASE
        WHEN $1 = 0 THEN NULL
        ELSE $1
    END
)
SELECT
    CASE WHEN $1 = 0 THEN to_char(finished_time, 'YYYY-MM')
         ELSE 'Last ' || $1
    END as month,
    count(id)::integer as match_count,
    sum(tie::integer)::integer AS tie_count,
    sum(goal_count)::integer as goal_count
FROM result
GROUP BY month
ORDER BY month DESC
"#,
            &[&limit],
        )
        .await?
        .into_iter()
        .map(Row)
        .collect())
}
