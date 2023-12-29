use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq, Deserialize, Serialize, sqlx::Type)]
#[sqlx(transparent)]
#[serde(transparent)]
pub struct MatchId(pub i32);

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq, Deserialize, Serialize, sqlx::Type)]
#[sqlx(transparent)]
#[serde(transparent)]
pub struct TeamId(pub i32);

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq, Deserialize, Serialize, sqlx::Type)]
#[sqlx(transparent)]
#[serde(transparent)]
pub struct LeagueId(pub i32);

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq, Deserialize, Serialize, sqlx::Type)]
#[sqlx(transparent)]
#[serde(transparent)]
pub struct UserId(pub i32);

#[derive(Debug, sqlx::Type)]
#[sqlx(type_name = "finished_type", rename_all = "camelCase")]
pub enum FinishedType {
    FullTime,
    OverTime,
    Penalties,
}
