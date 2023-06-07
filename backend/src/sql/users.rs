use super::sql_types::UserId;
use crate::db::Database;

pub struct Row(tokio_postgres::Row);

impl Row {
    pub fn id(&self) -> UserId {
        self.0.get(0)
    }
    pub fn name(&self) -> String {
        self.0.get(1)
    }
}

pub async fn users(dbc: &Database) -> Result<Vec<Row>, tokio_postgres::Error> {
    Ok(dbc
        .query(
            "users",
            // language=SQL
            r#"
SELECT id, name
FROM "user"
ORDER BY name
"#,
            &[],
        )
        .await?
        .into_iter()
        .map(Row)
        .collect())
}
