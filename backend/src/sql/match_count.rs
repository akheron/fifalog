use crate::db::Database;

pub struct Row(tokio_postgres::Row);

impl Row {
    pub fn count(&self) -> i64 {
        self.0.get(0)
    }
}

pub async fn match_count(dbc: &Database) -> Result<Row, tokio_postgres::Error> {
    Ok(Row(dbc
        .query_one(
            // language=SQL
            r#"
SELECT COUNT(*) FROM match
"#,
            &[],
        )
        .await?))
}
