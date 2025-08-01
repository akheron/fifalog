use eyre::Result;
use serde::Deserialize;
use std::net::SocketAddr;

#[derive(Deserialize)]
pub struct Env {
    pub env: String,
    pub database_url: String,
    pub database_pool_size: Option<u32>,
    pub bind: Option<SocketAddr>,
    pub secret: String,
    pub auth_username: String,
    pub auth_password: String,
}

impl Env {
    pub fn read() -> Result<Env> {
        Ok(envy::from_env::<Self>()?)
    }
}
