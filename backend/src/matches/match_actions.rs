use crate::matches::match_stats;
use crate::matches::match_stats::match_team_stats;
use crate::sql::sql_types::MatchId;
use crate::style::Style;
use maud::{html, Markup, PreEscaped};

pub enum MatchActionsMode {
    Blank,
    Stats(match_stats::MatchStats),
    Edit,
}

pub struct MatchActions {
    id: MatchId,
    mode: MatchActionsMode,
}

impl MatchActions {
    pub fn new(id: MatchId, mode: MatchActionsMode) -> Self {
        Self { id, mode }
    }

    pub fn render(&self) -> Markup {
        let id = format!("match-actions-{}", self.id);
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
            div id=(id) class=(style.class()) hx-target="this" {
                @if let MatchActionsMode::Edit = self.mode {
                    form .edit hx-post=(format!("/match/{}/finish", self.id)) hx-target="body" {
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
                        button hx-get=(format!("/match/{}/actions", self.id)) hx-target=(format!("#{id}")) { "cancel" }
                    }
                }
                @else {
                    @let show_stats = matches!(self.mode, MatchActionsMode::Stats(_));
                    div .buttons hx-sync="this" {
                        button
                            hx-get=(format!("/match/{}/actions", self.id))
                            hx-vals=[if show_stats { None } else { Some(r#"{ "mode": "stats" }"#) }] {
                                "stats "
                                @if show_stats { "△" } @else { "▽" }
                        }
                        span .hgap-s {}
                        button
                            hx-get=(format!("/match/{}/actions", self.id))
                            hx-vals=(r#"{ "mode": "edit" }"#) {
                                "edit"
                        }
                        span .hgap-s {}
                        button
                            hx-delete=(format!("/match/{}", self.id))
                            hx-target="#latest-matches"
                            hx-confirm="Really?" { "x" }
                    }
                    @if let MatchActionsMode::Stats(match_stats) = &self.mode {
                        (match_team_stats(match_stats))
                    }
                }
            }
            (style.as_comment())
        }
    }
}
