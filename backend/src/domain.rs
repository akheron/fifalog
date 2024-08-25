use crate::db::Database;
use crate::result::Result;
use crate::sql;
use crate::sql::sql_types::{MatchId, TeamId};

pub struct TeamTotalStats {
    pub wins: i64,
    pub losses: i64,
    pub matches: i64,
    pub goals_for: i64,
    pub goals_against: i64,
}

pub struct TeamPairStats {
    pub wins: i64,
    pub losses: i64,
    pub matches: i64,
}

pub struct MatchTeamStats {
    pub team_id: TeamId,
    pub total: Option<TeamTotalStats>,
    pub pair: Option<TeamPairStats>,
}

pub struct MatchStats {
    pub home: MatchTeamStats,
    pub away: MatchTeamStats,
}

pub async fn match_stats(dbc: &Database, id: MatchId) -> Result<MatchStats> {
    let stats = sql::match_team_stats(&dbc, id).await?;
    Ok(MatchStats {
        home: MatchTeamStats {
            team_id: stats.home_id,
            total: stats.total_wins_home.map(|wins| TeamTotalStats {
                wins,
                losses: stats.total_losses_home.unwrap(),
                matches: stats.total_matches_home.unwrap(),
                goals_for: stats.total_goals_for_home.unwrap(),
                goals_against: stats.total_goals_against_home.unwrap(),
            }),
            pair: stats.pair_wins_home.map(|wins| TeamPairStats {
                wins,
                losses: stats.pair_losses_home.unwrap(),
                matches: stats.pair_matches.unwrap(),
            }),
        },
        away: MatchTeamStats {
            team_id: stats.away_id,
            total: stats.total_wins_away.map(|wins| TeamTotalStats {
                wins,
                losses: stats.total_losses_away.unwrap(),
                matches: stats.total_matches_away.unwrap(),
                goals_for: stats.total_goals_for_away.unwrap(),
                goals_against: stats.total_goals_against_away.unwrap(),
            }),
            pair: stats.pair_wins_away.map(|wins| TeamPairStats {
                wins,
                losses: stats.pair_losses_away.unwrap(),
                matches: stats.pair_matches.unwrap(),
            }),
        },
    })
}
