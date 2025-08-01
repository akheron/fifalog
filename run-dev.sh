#!/bin/sh

# Set to prod to enable secure cookies
export ENV=dev

export DATABASE_URL="postgres://fifalog@localhost/fifalog"

# Set to a 64 byte random string in prod
export SECRET="0123456789012345678901234567890123456789012345678901234567890123"

# Login credentials
export AUTH_USERNAME=myuser
export AUTH_PASSWORD=mypass

exec cargo watch -x run
