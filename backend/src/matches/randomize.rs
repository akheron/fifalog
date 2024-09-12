use crate::sql::leagues::League;
use crate::sql::sql_types::{LeagueId, TeamId};
use rand::Rng;
use std::collections::HashSet;

pub struct RandomMatch {
    pub league_id: Option<LeagueId>,
    pub home_id: TeamId,
    pub away_id: TeamId,
}

pub fn get_random_match_from_leagues(
    leagues: &[League],
    exclude_teams: &HashSet<TeamId>,
) -> Option<RandomMatch> {
    let index = rand::thread_rng().gen_range(0..num_team_pairs(leagues, exclude_teams));
    nth_match(leagues, exclude_teams, index)
}

pub fn get_random_match_from_all(
    leagues: &[League],
    exclude_teams: &HashSet<TeamId>,
) -> Option<RandomMatch> {
    let teams = leagues
        .iter()
        .filter(|league| !league.exclude_random_all)
        .flat_map(|league| &league.teams)
        .map(|team| team.id)
        .collect::<Vec<_>>();

    if teams.len() >= exclude_teams.len() + 2 {
        let mut rng = rand::thread_rng();
        loop {
            let home_id = teams[rng.gen_range(0..teams.len())];
            let away_id = teams[rng.gen_range(0..teams.len())];
            if home_id != away_id
                && !exclude_teams.contains(&home_id)
                && !exclude_teams.contains(&away_id)
            {
                return Some(RandomMatch {
                    league_id: None,
                    home_id,
                    away_id,
                });
            }
        }
    } else {
        None
    }
}

fn num_team_pairs(leagues: &[League], exclude_teams: &HashSet<TeamId>) -> usize {
    let mut num = 0;
    for league in leagues {
        let num_teams = league
            .teams
            .iter()
            .filter(|t| !exclude_teams.contains(&t.id))
            .count();
        num += if num_teams > 0 {
            binomial_coefficient(num_teams, 2)
        } else {
            0
        };
    }
    num
}

fn binomial_coefficient(n: usize, k: usize) -> usize {
    let mut result = 1;
    for i in 0..k {
        result *= n - i;
        result /= i + 1;
    }
    result
}

fn nth_match(
    leagues: &[League],
    exclude_teams: &HashSet<TeamId>,
    target: usize,
) -> Option<RandomMatch> {
    let mut num = 0;
    for league in leagues {
        let teams = &league.teams;
        for i in 0..teams.len() {
            if exclude_teams.contains(&teams[i].id) {
                continue;
            }
            for j in i + 1..teams.len() {
                if exclude_teams.contains(&teams[j].id) {
                    continue;
                }
                if num == target {
                    let swap = rand::thread_rng().gen::<bool>();
                    let (home_id, away_id) = if swap {
                        (teams[j].id, teams[i].id)
                    } else {
                        (teams[i].id, teams[j].id)
                    };
                    return Some(RandomMatch {
                        league_id: Some(league.id),
                        home_id,
                        away_id,
                    });
                }
                num += 1;
            }
        }
    }
    None
}
