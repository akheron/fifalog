use crate::Env;
use cookie::Key;

#[derive(Clone)]
pub struct Config {
    pub env: String,
    pub username: String,
    pub password: String,
    pub secret: Key,
}

impl Config {
    pub fn from_env(env: &Env) -> Self {
        Self {
            env: env.env.clone(),
            username: env.auth_username.clone(),
            password: env.auth_password.clone(),
            secret: Key::from(env.secret.as_bytes()),
        }
    }
}
