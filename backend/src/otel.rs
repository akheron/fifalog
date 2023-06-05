use axum::extract::MatchedPath;
use axum::http::{Request, Response};
use futures_util::FutureExt;
use opentelemetry::global::BoxedTracer;
use opentelemetry::sdk::trace::TracerProvider;
use opentelemetry::sdk::{trace, Resource};
use opentelemetry::trace::{
    FutureExt as OtelFutureExt, Span, SpanBuilder, SpanKind, Status, TraceContextExt,
};
use opentelemetry::Context;
use opentelemetry_otlp::WithExportConfig;
use opentelemetry_semantic_conventions::{
    resource::{DEPLOYMENT_ENVIRONMENT, SERVICE_NAME},
    trace::{HTTP_METHOD, HTTP_STATUS_CODE, HTTP_TARGET, HTTP_USER_AGENT},
};
use std::fmt::{Debug, Display};
use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;
use std::task::Poll;
use tonic::metadata::MetadataMap;
use tower::{Layer, Service};

#[derive(Debug, Clone)]
pub struct OtelService<T> {
    inner: T,
    tracer: Arc<BoxedTracer>,
}

impl<T> OtelService<T> {
    pub fn new(inner: T) -> Self {
        Self {
            inner,
            tracer: Arc::new(opentelemetry::global::tracer("fifalog")),
        }
    }
}

impl<S, ReqBody, ResBody> Service<Request<ReqBody>> for OtelService<S>
where
    S: Service<Request<ReqBody>, Response = Response<ResBody>>,
    S::Future: 'static + Send,
    S::Error: Display,
    ReqBody: 'static,
{
    type Response = S::Response;
    type Error = S::Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>> + Send>>;

    fn poll_ready(&mut self, cx: &mut std::task::Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, req: Request<ReqBody>) -> Self::Future {
        let uri = req.uri();

        let span_name = if let Some(path) = req.extensions().get::<MatchedPath>() {
            // Matched route name
            path.as_str().to_string()
        } else {
            // Fall back to request path
            uri.path().to_string()
        };
        let method = req.method().to_string();

        let mut span = SpanBuilder::from_name(format!("{} {}", method, span_name))
            .with_kind(SpanKind::Server)
            .start(self.tracer.as_ref());

        span.set_attribute(HTTP_METHOD.string(method));
        if let Some(path) = uri.path_and_query() {
            span.set_attribute(HTTP_TARGET.string(path.as_str().to_string()));
        }
        if let Some(ua) = req
            .headers()
            .get("User-Agent")
            .and_then(|ua| ua.to_str().ok())
        {
            span.set_attribute(HTTP_USER_AGENT.string(ua.to_string()))
        }

        let ctx = Context::current_with_span(span);
        let fut = self
            .inner
            .call(req)
            .with_context(ctx.clone())
            .map(move |res| match res {
                Ok(res) => {
                    let span = ctx.span();
                    span.set_attribute(HTTP_STATUS_CODE.i64(res.status().as_u16().into()));
                    span.end();
                    Ok(res)
                }
                Err(error) => {
                    let span = ctx.span();
                    span.set_status(Status::error(format!("{}", error)));
                    span.end();
                    Err(error)
                }
            });
        Box::pin(fut)
    }
}

#[derive(Debug, Clone)]
pub struct OtelLayer;

pub fn otel_layer(
    honeycomb_api_key: &str,
    env: &str,
) -> Result<OtelLayer, Box<dyn std::error::Error>> {
    let mut metadata = MetadataMap::new();
    metadata.insert("x-honeycomb-team", honeycomb_api_key.parse().unwrap());

    opentelemetry::global::set_tracer_provider(
        TracerProvider::builder()
            .with_config(
                trace::config()
                    .with_sampler(trace::Sampler::AlwaysOn)
                    .with_resource(Resource::new(vec![
                        SERVICE_NAME.string("fifalog"),
                        DEPLOYMENT_ENVIRONMENT.string(env.to_string()),
                    ])),
            )
            .with_batch_exporter(
                opentelemetry_otlp::SpanExporterBuilder::from(
                    opentelemetry_otlp::new_exporter()
                        .tonic()
                        .with_endpoint("https://api.honeycomb.io:443")
                        .with_metadata(metadata.clone()),
                )
                .build_span_exporter()?,
                opentelemetry::runtime::Tokio,
            )
            .build(),
    );

    Ok(OtelLayer)
}

impl<S> Layer<S> for OtelLayer {
    type Service = OtelService<S>;

    fn layer(&self, inner: S) -> Self::Service {
        OtelService::new(inner)
    }
}
