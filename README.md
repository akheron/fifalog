# Fifalog

Log your EA Sports FIFA matches and keep statistics!

## Development

Create a PostgreSQL database:

```sh
createuser fifalog
createdb -O fifalog fifalog
```

Edit `backend/run-dev.sh` to your liking.

Run the backend:

```sh
cd backend
./run-dev.sh
```

This creates the database structure, but you need to add 2 users and some leagues and teams manually.

Run the frontend in another terminal:

```sh
cd frontend
yarn dev
```

Open http://localhost:1234 in the browser.
