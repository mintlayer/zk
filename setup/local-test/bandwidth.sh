#!/usr/bin/env bash

export PATH="/home/azureuser/.nvm/versions/node/v18.18.0/bin:$PATH"

NODE_ENV=test INDEX=0 npx hardhat run ./scripts/run-many-user.ts &
NODE_ENV=test INDEX=1 npx hardhat run ./scripts/run-many-user.ts &
NODE_ENV=test INDEX=2 npx hardhat run ./scripts/run-many-user.ts &
NODE_ENV=test INDEX=3 npx hardhat run ./scripts/run-many-user.ts &
NODE_ENV=test INDEX=4 npx hardhat run ./scripts/run-many-user.ts &
# NODE_ENV=test INDEX=5 npx hardhat run ./scripts/run-many-user.ts &
# NODE_ENV=test INDEX=6 npx hardhat run ./scripts/run-many-user.ts &
# NODE_ENV=test INDEX=7 npx hardhat run ./scripts/run-many-user.ts &
# NODE_ENV=test INDEX=8 npx hardhat run ./scripts/run-many-user.ts &
# NODE_ENV=test INDEX=9 npx hardhat run ./scripts/run-many-user.ts &

wait