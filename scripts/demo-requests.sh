#!/usr/bin/env sh
set -eu

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "Health"
curl -s "$BASE_URL/health"
printf "\n\n"

echo "Complete document search"
curl -s "$BASE_URL/api/vehicles/1HGCM82633A004352/documents"
printf "\n\n"

echo "Empty result search"
curl -s "$BASE_URL/api/vehicles/2HGCM82633A004353/documents"
printf "\n\n"

echo "Partial result search"
curl -s "$BASE_URL/api/vehicles/1HGCM82633A00435S/documents"
printf "\n\n"

echo "Both upstreams unavailable"
curl -s "$BASE_URL/api/vehicles/1HGCM82633A00435X/documents"
printf "\n"
