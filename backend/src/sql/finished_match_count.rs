use crate::db::Database;

pub struct Row(tokio_postgres::Row);

impl Row {
    pub fn count(&self) -> i64 {
        self.0.get(0)
    }
}

pub async fn finished_match_count(dbc: &Database) -> Result<Row, tokio_postgres::Error> {
    Ok(Row(dbc
        .query_one(
            "finished_match_count",
            // language=SQL
            r#"
SELECT COUNT(*) FROM match WHERE finished_type IS NOT NULL
"#,
            &[],
        )
        .await?))
}
