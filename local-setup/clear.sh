#!/usr/bin/env bash

docker compose down --volumes
docker compose -f docker-compose-dev.yml down --volumes
