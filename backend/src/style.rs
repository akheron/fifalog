use lightningcss::printer::PrinterOptions;
use lightningcss::stylesheet::{ParserOptions, StyleSheet};
use maud::{Markup, PreEscaped};
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
}

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
    processCssFromComments(document.body.innerHTML);
</script>
"#,
);
