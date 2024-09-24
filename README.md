# Fifalog

Log your EA Sports FIFA matches and keep statistics!

## Development

Create a PostgreSQL database:

```sh
createuser fifalog
createdb -O fifalog fifalog
```

Edit `run-dev.sh` to your liking.

Run the app:

```sh
./run-dev.sh
```

This creates the database structure, but you need to add 2 users and some leagues and teams manually.

Open http://localhost:8080 in the browser.
