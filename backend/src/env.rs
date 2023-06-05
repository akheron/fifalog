use serde::Deserialize;
use std::net::SocketAddr;

#[derive(Deserialize)]
pub struct Env {
    pub env: String,
    pub database_url: String,
    pub database_pool_size: Option<usize>,
    pub bind: Option<SocketAddr>,
    pub secret: String,
    pub auth_username: String,
    pub auth_password: String,
    pub asset_path: String,
    pub honeycomb_api_key: Option<String>,
}

impl Env {
    pub fn read() -> Result<Env, Box<dyn std::error::Error>> {
        Ok(envy::from_env::<Self>()?)
    }
}
