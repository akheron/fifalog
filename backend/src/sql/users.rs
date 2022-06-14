use super::sql_types::UserId;
use tokio_postgres::Client;

pub struct Row(tokio_postgres::Row);

impl Row {
    pub fn id(&self) -> UserId {
        self.0.get(0)
    }
    pub fn name(&self) -> String {
        self.0.get(1)
    }
}

pub async fn users(dbc: &Client) -> Result<Vec<Row>, tokio_postgres::Error> {
    Ok(dbc
        .query(
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
