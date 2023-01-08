#!/bin/sh

# Set to prod to enable secure cookies
export ENV=dev

export DATABASE_URL="host=localhost user=fifalog dbname=fifalog"

# Set to a 64 byte random string in prod
export SECRET="0123456789012345678901234567890123456789012345678901234567890123"

# Login credentials
export AUTH_USERNAME=myuser
export AUTH_PASSWORD=mypass

# Not needed when parcel serves assets, otherwise set to parcel output dir (../frontend/dist)
export ASSET_PATH=

exec cargo run
