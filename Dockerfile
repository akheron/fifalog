FROM rust AS chef
WORKDIR /app
RUN cargo install cargo-chef

FROM chef AS backend-planner
COPY backend .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS backend-builder
COPY --from=backend-planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
COPY backend .
RUN cargo build --release

FROM node:16 AS frontend-builder
WORKDIR /app
COPY frontend .
RUN yarn install --frozen-lockfile && yarn build

FROM debian:buster-slim
RUN mkdir /assets
COPY --from=backend-builder /app/target/release/fifalog /usr/local/bin/fifalog
COPY --from=frontend-builder /app/dist/index.* /assets
ENV ASSET_PATH=/assets

EXPOSE 8080
CMD ["fifalog"]
