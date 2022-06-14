FROM rust:1.61 as builder-backend
WORKDIR /app
COPY backend .
RUN cargo build --release
RUN cp target/release/fifalog .

FROM node:16 AS builder-frontend
WORKDIR /app
COPY frontend frontend
COPY package.json yarn.lock tsconfig.json .
RUN yarn install --frozen-lockfile
RUN cd frontend && yarn build

FROM debian:buster-slim
RUN mkdir /assets
COPY --from=builder-backend /app/fifalog /usr/local/bin/fifalog
COPY --from=builder-frontend /app/dist/frontend/index.* /assets
ENV ASSET_PATH=/assets

EXPOSE 8080
CMD ["fifalog"]
