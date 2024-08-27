use crate::style::STYLE_SCRIPT;
use maud::{html, Markup, PreEscaped, DOCTYPE};

pub fn page(content: Markup) -> Markup {
    html! {
        (DOCTYPE)
        html lang="en" {
            head {
                title { "FIFA log" }
                meta charset="utf-8";
                meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1";
                script defer src="https://unpkg.com/htmx.org@2.0.2" integrity="sha384-Y7hw+L/jvKeWIRRkqWYfPcvVxHzVzn5REgzbawhxAuQGwX1XWe70vji+VSeHOThJ" crossorigin="anonymous" {}
                style { (PreEscaped(r#"
                    * {
                      box-sizing: border-box;
                    }

                    body {
                      font-family: sans-serif;
                    }

                    button, select {
                      color: #000;
                      font-size: 14px;
                      background-color: #f0f0f0;
                      border-radius: 3px;
                      border: 1px solid #000;
                      padding: 2px 5px;
                      margin: 0;

                      &[disabled] {
                        color: #666;
                        border-color: #666;
                      }
                    }

                    .vgap-s {
                      padding-bottom: 8px;
                    }
                    .vgap-m {
                      padding-bottom: 16px;
                    }
                    .vgap-l {
                      padding-bottom: 32px;
                    }
                    .hgap-s {
                      padding-right: 8px;
                    }
                    .hgap-m {
                      padding-right: 16px;
                    }
                    .hgap-l {
                      padding-right: 32px;
                    }
                    .filler {
                      flex: 1 0 0;
                    }

                    button.text {
                      background: none;
                      border: none;
                      outline: none;
                      margin: 0;
                      padding: 0;
                      font-size: inherit;
                      color: #0000ee;
                      cursor: pointer;
                      text-decoration: underline;
                    }
                "#)) }
            }
            body {
                (content)
                (STYLE_SCRIPT)
            }
        }
    }
}
