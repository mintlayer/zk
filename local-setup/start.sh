#!/usr/bin/env bash
# docker compose up -d

# usage: ./start.sh INSTANCE_TYPE 
# Instance type is specifying the docker image to take:
# see https://hub.docker.com/r/matterlabs/local-node/tags for full list.
# latest2.0 - is the 'main' one.

INSTANCE_TYPE=${1:-zkthunder}

export INSTANCE_TYPE=$INSTANCE_TYPE
echo "Starting zkthunder with instance type: $INSTANCE_TYPE"
docker compose pull
# docker compose up 
docker compose up

check_all_services_healthy() {
  service="zkthunder"
  # service="zksync"
  (docker compose ps $service | grep "(healthy)")
  if [ $? -eq 0 ]; then
    return 0
  else
    return 1  # If any service is not healthy, return 1
  fi
}

# Loop until all services are healthy
while ! check_all_services_healthy; do
  echo "Services are not yet healthy, waiting..."
  sleep 10  # Check every 10 seconds
done

echo "All services are healthy!"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
DARKGRAY='\033[0;30m'
ORANGE='\033[0;33m'
echo -e "${GREEN}"

echo -e "SUCCESS, Your local zkthunder is now running! Find the information below for accessing each service."
echo -e "┌──────────────────────────┬────────────────────────┬──────────────────────────────────────────────────┐"
echo -e "│         Service          │          URL           │                   Description                    │"
echo -e "├──────────────────────────┼────────────────────────┼──────────────────────────────────────────────────┤"
echo -e "│ ${ORANGE}HyperExplorer            ${GREEN}│ ${BLUE}http://localhost:15000${GREEN} │ ${DARKGRAY}Explorer for communication between ZK Chains     ${GREEN}│"
echo -e "│ ${ORANGE}L1 Explorer              ${GREEN}│ ${BLUE}http://localhost:15001${GREEN} │ ${DARKGRAY}Block Explorer for Layer 1 (reth)                ${GREEN}│"
echo -e "│ ${ORANGE}L2 Explorer (All Chains) ${GREEN}│ ${BLUE}http://localhost:15005${GREEN} │ ${DARKGRAY}Block Explorer for all L2 ZK Chains              ${GREEN}│"
echo -e "│ ${ORANGE}L1 Chain (reth)          ${GREEN}│ ${BLUE}http://localhost:15045${GREEN} │ ${DARKGRAY}HTTP Endpoint for L1 reth node                   ${GREEN}│"
echo -e "│ ${ORANGE}ZK Mintlayer             ${GREEN}│ ${BLUE}http://localhost:15100${GREEN} │ ${DARKGRAY}HTTP Endpoint for L2 ZK Chain                    ${GREEN}│"
echo -e "│ ${ORANGE}                         ${GREEN}│ ${BLUE}ws://localhost:15101${GREEN}   │ ${DARKGRAY}Websocket Endpoint for L2 ZK Chain               ${GREEN}│"
echo -e "│ ${ORANGE}                         ${GREEN}│ ${BLUE}http://localhost:15102${GREEN} │ ${DARKGRAY}ZK Chain Explorer API                            ${GREEN}│"
echo -e "│ ${ORANGE}pgAdmin                  ${GREEN}│ ${BLUE}http://localhost:15430${GREEN} │ ${DARKGRAY}UI to manage the PostgreSQL databases            ${GREEN}│"
echo -e "│ ${ORANGE}PostgreSQL DB Server     ${GREEN}│ ${BLUE}http://localhost:15432${GREEN} │ ${DARKGRAY}Database server for all services running locally ${GREEN}│"
echo -e "└──────────────────────────┴────────────────────────┴──────────────────────────────────────────────────┘"