use super::sql_types::UserId;
use crate::db::Database;

#[derive(sqlx::FromRow)]
pub struct Row {
    pub id: UserId,
    pub name: String,
}

pub async fn users(dbc: &Database) -> Result<Vec<Row>, sqlx::Error> {
    sqlx::query_as::<_, Row>(
        // language=SQL
        r#"
SELECT id, name
FROM "user"
ORDER BY name
"#,
    )
    .fetch_all(dbc)
    .await
}
