use crate::domain;
use crate::sql::sql_types::MatchId;
use crate::style::Style;
use maud::{html, Markup, PreEscaped};

pub enum MatchActionsMode {
    Blank,
    Stats(domain::MatchStats),
    Edit,
}

pub fn match_actions(match_id: MatchId, mode: MatchActionsMode) -> Markup {
    let id = format!("match-actions-{match_id}");
    let style = Style::new(
        r#"
            .buttons {
                text-align: center;

                button {
                  font-size: 12px;
                  line-height: 12px;
                }
            }

            .stats {
                font-size: 13px;

                span.dimmed {
                    display: inline-block;
                    margin: 0 6px;
                    color: #999;
                }
            }

            .edit {
                margin-top: 10px;
                text-align: center;

                input {
                    width: 20px;
                    text-align: center;
                }

                input[type='number']::-webkit-inner-spin-button,
                input[type='number']::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }

                .penalties {
                    font-size: 10px;
                }
            }
        "#,
    );

    html! {
        div id=(id) class=(style.class()) hx-target="this" hx-swap="outerHTML" {
            @if let MatchActionsMode::Edit = mode {
                form .edit hx-post=(format!("/match/{}/finish", match_id)) hx-target="body" hx-swap="outerHTML" {
                    input name="homeScore" type="number" required {}
                    " - "
                    input name="awayScore" type="number" required {}
                    span .hgap-s {}
                    select name="finishedType" {
                        option value="fullTime" { "full time" }
                        option value="overTime" { "overtime" }
                        option value="penalties" { "penalties" }
                    }
                    " "
                    span .penalties {
                        " ("
                        input name="homePenaltyGoals" type="number" required {}
                        " - "
                        input name="awayPenaltyGoals" type="number" required {}
                        " P)"
                    }
                    script {
                        (PreEscaped(format!(r##"(() => {{
                            const select = document.querySelector('#{id} .edit select[name="finishedType"]');
                            const onFinishedTypeChange = (e) => {{
                                const penalties = document.querySelector('#{id} .edit .penalties');
                                const show = select.value === 'penalties';
                                penalties.style.display = show ? 'inline' : 'none';
                                document.querySelectorAll('#{id} .edit .penalties input').forEach((input) => {{
                                    input.required = show;
                                }});
                            }}
                            select.addEventListener('change', onFinishedTypeChange);
                            onFinishedTypeChange();
                        }})()"##)))
                    }
                    span .hgap-s {}
                    button { "save" }
                    " "
                    button hx-get=(format!("/match/{}/actions", match_id)) hx-target=(format!("#{id}")) { "cancel" }
                }
            }
            @else {
                @let show_stats = matches!(mode, MatchActionsMode::Stats(_));
                div .buttons hx-sync="this" {
                    button
                        hx-get=(format!("/match/{}/actions", match_id))
                        hx-vals=[if show_stats { None } else { Some(r#"{ "mode": "stats" }"#) }] {
                            "stats "
                            @if show_stats { "△" } @else { "▽" }
                    }
                    span .hgap-s {}
                    button
                        hx-get=(format!("/match/{}/actions", match_id))
                        hx-vals=(r#"{ "mode": "edit" }"#) {
                            "edit"
                    }
                    span .hgap-s {}
                    button
                        hx-delete=(format!("/match/{}", match_id))
                        hx-target="#latest-matches"
                        hx-swap="outerHTML"
                        hx-confirm="Really?" { "x" }
                }
                @if let MatchActionsMode::Stats(match_stats) = mode {
                    (match_team_stats(match_stats))
                }
            }
        }
        (style.as_comment())
    }
}

fn match_team_stats(stats: domain::MatchStats) -> Markup {
    let style = Style::new(
        r#"
            padding-top: 8px;
            font-size: 13px;

            .row {
                display: flex;
            }

            .row > :nth-child(1) {
                width: 40%;
                text-align: right;
            }

            .row > :nth-child(2) {
                text-align: center;
                width: 20%;
            }

            .row > :nth-child(3) {
                width: 40%;
            }

            .dimmed {
                display: inline-block;
                color: #999;
                padding: 0 6px;
            }

            .score {
                font-size: 18px;
            }

            .overtime {
                font-size: 13px;
            }

            .player {
                font-size: 13px;
                color: #999;
            }

            .player strong {
                color: #008000;
            }
        "#,
    );
    html! {
        div class=(style.class()) {
            div .row {
                div {
                    @if let Some(pair) = stats.home.pair {
                        span .dimmed {
                            (pair.wins) "/" (pair.matches)
                        }
                        " "
                        (percentage(pair.wins, pair.matches))
                    } @else { "-" }
                }
                div { strong { "pair" } }
                div {
                    @if let Some(pair) = stats.away.pair {
                        (percentage(pair.wins, pair.matches))
                        " "
                        span .dimmed {
                            (pair.wins) "/" (pair.matches)
                        }
                    } @else { "-" }
                }
            }
            div .row {
                div {
                    @if let Some(total) = &stats.home.total {
                        span .dimmed {
                            (total.wins) "/" (total.matches)
                        }
                        " "
                        (percentage(total.wins, total.matches))
                    } @else { "-" }
                }
                div { strong { "total" } }
                div {
                    @if let Some(total) = &stats.away.total {
                        (percentage(total.wins, total.matches))
                        " "
                        span .dimmed {
                            (total.wins) "/" (total.matches)
                        }
                    } @else { "-" }
                }
            }
            div .row {
                div {
                    @if let Some(total) = &stats.home.total {
                        (round(total.goals_for as f64 / total.matches as f64))
                    } @else { "-" }
                }
                div { strong { "gf" } }
                div {
                    @if let Some(total) = &stats.away.total {
                        (round(total.goals_for as f64 / total.matches as f64))
                    } @else { "-" }
                }
            }
            div .row {
                div {
                    @if let Some(total) = &stats.home.total {
                        (round(total.goals_against as f64 / total.matches as f64))
                    } @else { "-" }
                }
                div { strong { "ga" } }
                div {
                    @if let Some(total) = &stats.away.total {
                        (round(total.goals_against as f64 / total.matches as f64))
                    } @else { "-" }
                }
            }
        }
        (style.as_comment())
    }
}

fn percentage(numerator: i64, denominator: i64) -> String {
    if denominator == 0 {
        "0 %".to_string()
    } else {
        format!(
            "{} %",
            (numerator as f64 / denominator as f64 * 100.0).round()
        )
    }
}

fn round(n: f64) -> String {
    format!("{:.2}", (n * 100.0).round() / 100.0)
}
