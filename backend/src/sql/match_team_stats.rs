use crate::db::Database;
use crate::sql::sql_types::{MatchId, TeamId};

pub struct Row(tokio_postgres::Row);

impl Row {
    pub fn home_id(&self) -> TeamId {
        self.0.get(0)
    }
    pub fn away_id(&self) -> TeamId {
        self.0.get(1)
    }
    pub fn total_matches_home(&self) -> Option<i64> {
        self.0.get(2)
    }
    pub fn total_wins_home(&self) -> Option<i64> {
        self.0.get(3)
    }
    pub fn total_losses_home(&self) -> Option<i64> {
        self.0.get(4)
    }
    pub fn total_goals_for_home(&self) -> Option<i64> {
        self.0.get(5)
    }
    pub fn total_goals_against_home(&self) -> Option<i64> {
        self.0.get(6)
    }
    pub fn total_matches_away(&self) -> Option<i64> {
        self.0.get(7)
    }
    pub fn total_wins_away(&self) -> Option<i64> {
        self.0.get(8)
    }
    pub fn total_losses_away(&self) -> Option<i64> {
        self.0.get(9)
    }
    pub fn total_goals_for_away(&self) -> Option<i64> {
        self.0.get(10)
    }
    pub fn total_goals_against_away(&self) -> Option<i64> {
        self.0.get(11)
    }
    pub fn pair_matches(&self) -> Option<i64> {
        self.0.get(12)
    }
    pub fn pair_wins_home(&self) -> Option<i64> {
        self.0.get(13)
    }
    pub fn pair_losses_home(&self) -> Option<i64> {
        self.0.get(14)
    }
    pub fn pair_wins_away(&self) -> Option<i64> {
        self.0.get(15)
    }
    pub fn pair_losses_away(&self) -> Option<i64> {
        self.0.get(16)
    }
}

pub async fn match_team_stats(
    dbc: &Database,
    match_id: MatchId,
) -> Result<Option<Row>, tokio_postgres::Error> {
    Ok(dbc
        .query_opt(
            // language=SQL
            r#"
WITH total_matches AS (
    SELECT
        home_id AS team_id,
        1 AS matches,
        CASE WHEN home_score > away_score THEN 1 ELSE 0 END AS wins,
        CASE WHEN home_score < away_score THEN 1 ELSE 0 END AS losses,
        home_score AS goals_for,
        away_score AS goals_against
    FROM match
    WHERE finished_type IS NOT NULL

    UNION ALL

    SELECT
        away_id AS team_id,
        1 AS matches,
        CASE WHEN home_score < away_score THEN 1 ELSE 0 END AS wins,
        CASE WHEN home_score > away_score THEN 1 ELSE 0 END AS losses,
        away_score AS goals_for,
        home_score AS goals_against
    FROM match
    WHERE finished_type IS NOT NULL
), team_stats AS (
    SELECT
        team_id,
        SUM(matches) AS matches,
        SUM(wins) AS wins,
        SUM(losses) AS losses,
        SUM(goals_for) AS goals_for,
        SUM(goals_against) AS goals_against
    FROM total_matches
    GROUP BY team_id
), pair_matches AS (
    SELECT
        home_id AS team_1,
        away_id AS team_2,
        1 AS matches,
        CASE WHEN home_score > away_score THEN 1 ELSE 0 END AS team_1_win,
        CASE WHEN home_score < away_score THEN 1 ELSE 0 END AS team_1_loss,
        CASE WHEN home_score < away_score THEN 1 ELSE 0 END AS team_2_win,
        CASE WHEN home_score > away_score THEN 1 ELSE 0 END AS team_2_loss
    FROM match
    WHERE finished_type IS NOT NULL

    UNION ALL

    SELECT
        away_id AS team_1,
        home_id AS team_2,
        1 AS matches,
        CASE WHEN home_score < away_score THEN 1 ELSE 0 END AS team_1_win,
        CASE WHEN home_score > away_score THEN 1 ELSE 0 END AS team_1_loss,
        CASE WHEN home_score > away_score THEN 1 ELSE 0 END AS team_2_win,
        CASE WHEN home_score < away_score THEN 1 ELSE 0 END AS team_2_loss
    FROM match
    WHERE finished_type IS NOT NULL
), pair_stats AS (
    SELECT
        team_1,
        team_2,
        SUM(matches) AS pair_matches,
        SUM(team_1_win) AS team_1_wins,
        SUM(team_1_loss) AS team_1_losses,
        SUM(team_2_win) AS team_2_wins,
        SUM(team_2_loss) AS team_2_losses
    FROM pair_matches
    GROUP BY team_1, team_2
)
SELECT
    match.home_id,
    match.away_id,
    ts1.matches AS total_matches_home,
    ts1.wins AS total_wins_home,
    ts1.losses AS total_losses_home,
    ts1.goals_for AS total_goals_for_home,
    ts1.goals_against AS total_goals_against_home,
    ts2.matches AS total_matches_away,
    ts2.wins AS total_wins_away,
    ts2.losses AS total_losses_away,
    ts2.goals_for AS total_goals_for_away,
    ts2.goals_against AS total_goals_against_away,
    ps.pair_matches AS pair_matches,
    ps.team_1_wins AS pair_wins_home,
    ps.team_1_losses AS pair_losses_home,
    ps.team_2_wins AS pair_wins_away,
    ps.team_2_losses AS pair_losses_away
FROM match
LEFT JOIN team_stats ts1 ON ts1.team_id = match.home_id
LEFT JOIN team_stats ts2 ON ts2.team_id = match.away_id
LEFT JOIN pair_stats ps ON ps.team_1 = match.home_id AND ps.team_2 = match.away_id
WHERE match.id = $1
    "#,
            &[&match_id],
        )
        .await?
        .map(Row))
}
