use sqlx::{Pool, Postgres};

pub type Database = Pool<Postgres>;

pub fn is_integrity_error(err: &sqlx::Error) -> bool {
    match err {
        sqlx::Error::Database(e) => {
            e.is_unique_violation() || e.is_foreign_key_violation() || e.is_check_violation()
        }
        _ => false,
    }
}
