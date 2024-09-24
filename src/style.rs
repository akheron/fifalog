use lightningcss::printer::PrinterOptions;
use lightningcss::stylesheet::{ParserOptions, StyleSheet};
use maud::{html, Markup, PreEscaped};
use std::hash::{DefaultHasher, Hash, Hasher};

pub struct Style {
    css: String,
    hash: u64,
}

impl Style {
    pub fn new(css: &str) -> Self {
        let hash = hash(&css);
        let wrapped = format!(".style-{:x} {{ {} }}", hash, css);
        let stylesheet = StyleSheet::parse(&wrapped, ParserOptions::default()).unwrap();
        let output = stylesheet
            .to_css(PrinterOptions {
                minify: true,
                ..PrinterOptions::default()
            })
            .unwrap();
        Style {
            hash,
            css: output.code,
        }
    }

    pub fn class(&self) -> String {
        format!("style-{:x}", self.hash)
    }

    pub fn as_comment(&self) -> Markup {
        PreEscaped(format!("<!-- css {:x} {} -->", self.hash, self.css))
    }

    pub fn as_style_tag(&self) -> Markup {
        html! {
            style data-hash=(format!("{:x}", self.hash)) {
                (PreEscaped(&self.css))
            }
        }
    }

    pub fn into_markup<Construct>(self, construct: Construct) -> StyledMarkup
    where
        Construct: FnOnce(&str, &mut StyleContainer) -> Markup,
    {
        let mut container = StyleContainer(vec![]);
        let markup = construct(&self.class(), &mut container);
        container.0.push(self);
        StyledMarkup {
            markup,
            styles: container.0,
        }
    }
}

pub struct Unstyled;

impl Unstyled {
    pub fn into_markup<Construct>(self, construct: Construct) -> StyledMarkup
    where
        Construct: FnOnce(&mut StyleContainer) -> Markup,
    {
        let mut container = StyleContainer(vec![]);
        let markup = construct(&mut container);
        StyledMarkup {
            markup,
            styles: container.0,
        }
    }
}

pub struct StyleContainer(Vec<Style>);

fn hash(s: &str) -> u64 {
    let mut hasher = DefaultHasher::new();
    s.hash(&mut hasher);
    hasher.finish()
}

pub const STYLE_SCRIPT: PreEscaped<&'static str> = PreEscaped(
    r#"
<script>
    function processCssFromComments(text) {
        for (const [_, hash, css] of text.matchAll(/<!-- css ([0-9a-f]+) (.*?) -->/g)) {
            if (document.querySelector(`style[data-hash="${hash}"]`)) continue;
            const style = document.createElement('style');
            style.dataset.hash = hash;
            style.textContent = css.replace(/-\\-/g, '--');
            document.head.appendChild(style);
        }
    }
    document.body.addEventListener('htmx:afterRequest', (event) => {
        if (event.detail.successful) {
            processCssFromComments(event.detail.xhr.responseText);
        }
    });
</script>
"#,
);

pub struct StyledMarkup {
    markup: Markup,
    styles: Vec<Style>,
}

impl StyledMarkup {
    pub fn style_as_comment(self) -> Markup {
        html! {
            (self.markup)
            @for style in self.styles {
                (style.as_comment())
            }
        }
    }

    pub fn eject_style(self, style_container: &mut StyleContainer) -> Markup {
        style_container.0.extend(self.styles);
        self.markup
    }

    pub fn into_parts(self) -> (Markup, Markup) {
        let style_tags = html! {
            @for style in self.styles {
                (style.as_style_tag())
            }
        };
        (self.markup, style_tags)
    }
}
