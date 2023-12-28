use crate::GenericResponse;
use async_trait::async_trait;
use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use axum::Extension;
use deadpool_postgres::{Manager, ManagerConfig, Pool, RecyclingMethod};
use std::str::FromStr;
use tokio_postgres::error::{Error, SqlState};
use tokio_postgres::types::ToSql;
use tokio_postgres::{NoTls, Row};

use crate::utils::internal_error;

pub struct Database(deadpool::managed::Object<Manager>);

impl Database {
    pub async fn query(
        &self,
        statement: &str,
        params: &[&(dyn ToSql + Sync)],
    ) -> Result<Vec<Row>, Error> {
        self.0.query(statement, params).await
    }

    pub async fn query_one(
        &self,
        statement: &str,
        params: &[&(dyn ToSql + Sync)],
    ) -> Result<Row, Error> {
        self.0.query_one(statement, params).await
    }

    pub async fn query_opt(
        &self,
        statement: &str,
        params: &[&(dyn ToSql + Sync)],
    ) -> Result<Option<Row>, Error> {
        self.0.query_opt(statement, params).await
    }

    pub async fn execute(
        &self,
        statement: &str,
        params: &[&(dyn ToSql + Sync)],
    ) -> Result<u64, Error> {
        self.0.execute(statement, params).await
    }
}

#[async_trait]
impl<S> FromRequestParts<S> for Database
where
    S: Send + Sync,
{
    type Rejection = GenericResponse;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let Extension(pool) = Extension::<Pool>::from_request_parts(parts, state)
            .await
            .map_err(internal_error)?;

        let conn = pool.get().await.map_err(internal_error)?;

        Ok(Self(conn))
    }
}

pub fn database_pool(url: &str, pool_size: usize) -> Result<Pool, Error> {
    let cfg = tokio_postgres::Config::from_str(url)?;
    let mgr = Manager::from_config(
        cfg,
        NoTls,
        ManagerConfig {
            recycling_method: RecyclingMethod::Fast,
        },
    );
    Ok(Pool::builder(mgr).max_size(pool_size).build().unwrap())
}

pub type DatabaseLayer = Extension<Pool>;

pub fn database_layer(pool: Pool) -> DatabaseLayer {
    Extension(pool)
}

pub fn is_integrity_error(err: &Error) -> bool {
    err.code()
        .map(|s| s == &SqlState::INTEGRITY_CONSTRAINT_VIOLATION)
        .unwrap_or(false)
}
