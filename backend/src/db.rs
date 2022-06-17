use crate::GenericResponse;
use async_trait::async_trait;
use axum::extract::{FromRequest, RequestParts};
use axum::Extension;
use deadpool_postgres::{Manager, ManagerConfig, Pool, RecyclingMethod};
use std::str::FromStr;
use tokio_postgres::NoTls;

use crate::utils::internal_error;

pub struct Database(pub deadpool::managed::Object<Manager>);

#[async_trait]
impl<B> FromRequest<B> for Database
where
    B: Send,
{
    type Rejection = GenericResponse;

    async fn from_request(req: &mut RequestParts<B>) -> Result<Self, Self::Rejection> {
        let Extension(pool) = Extension::<Pool>::from_request(req)
            .await
            .map_err(internal_error)?;

        let conn = pool.get().await.map_err(internal_error)?;

        Ok(Self(conn))
    }
}

pub fn database_pool(url: &str, pool_size: usize) -> Result<Pool, tokio_postgres::Error> {
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
