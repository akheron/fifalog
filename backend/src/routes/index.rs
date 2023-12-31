use crate::db::Database;
use crate::result::Result;
use crate::routes::match_list::MatchListTemplate;
use crate::routes::stats::StatsTemplate;
use askama::Template;
use axum::Extension;

#[derive(Template)]
#[template(path = "index.html")]
pub struct IndexTemplate {
    stats: StatsTemplate,
    match_list: MatchListTemplate,
}

pub async fn index_route(Extension(dbc): Extension<Database>) -> Result<IndexTemplate> {
    Ok(IndexTemplate {
        stats: StatsTemplate::new(&dbc, false).await?,
        match_list: MatchListTemplate::new(&dbc).await?,
    })
}
