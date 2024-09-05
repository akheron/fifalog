use crate::db::Database;
use crate::result::Result;
use crate::sql;
use crate::sql::sql_types::MatchId;

pub struct TeamTotalStats {
    pub wins: i64,
    pub matches: i64,
    pub goals_for: i64,
    pub goals_against: i64,
}

pub struct TeamPairStats {
    pub wins: i64,
    pub matches: i64,
}

pub struct MatchTeamStats {
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
            total: stats.total_wins_home.map(|wins| TeamTotalStats {
                wins,
                matches: stats.total_matches_home.unwrap(),
                goals_for: stats.total_goals_for_home.unwrap(),
                goals_against: stats.total_goals_against_home.unwrap(),
            }),
            pair: stats.pair_wins_home.map(|wins| TeamPairStats {
                wins,
                matches: stats.pair_matches.unwrap(),
            }),
        },
        away: MatchTeamStats {
            total: stats.total_wins_away.map(|wins| TeamTotalStats {
                wins,
                matches: stats.total_matches_away.unwrap(),
                goals_for: stats.total_goals_for_away.unwrap(),
                goals_against: stats.total_goals_against_away.unwrap(),
            }),
            pair: stats.pair_wins_away.map(|wins| TeamPairStats {
                wins,
                matches: stats.pair_matches.unwrap(),
            }),
        },
    })
}
