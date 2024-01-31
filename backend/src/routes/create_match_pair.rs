use crate::api_types::User;
use crate::db::Database;
use crate::sql::sql_types::UserId;
use crate::sql::users;
use askama::Template;
use eyre::Result;

#[derive(Template)]
#[template(path = "components/create_match_pair.html")]
pub struct CreateMatchPairTemplate {
    users: Vec<User>,
    user1: UserId,
    user2: UserId,
}

impl CreateMatchPairTemplate {
    pub async fn new(dbc: &Database) -> Result<Option<Self>> {
        let users = users(dbc)
            .await?
            .into_iter()
            .map(|row| User::from(row))
            .collect::<Vec<_>>();
        if users.len() < 2 {
            return Ok(None);
        }
        let user1 = users[0].id;
        let user2 = users[1].id;
        Ok(Some(Self {
            users,
            user1,
            user2,
        }))
    }
}
