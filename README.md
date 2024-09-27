# ZkThunder User Document

## Attribution

ZkThunder is a derivative work based on ZkSync. We would like to acknowledge and thank the ZkSync team for their groundbreaking work in the field of zero-knowledge proofs and Layer 2 scaling solutions.

For more information about ZkSync, please visit their GitHub repository: https://github.com/matter-labs/zksync

This Zk implementation is made by Salusec (https://salusec.io/) to enhance Mintlayer network. 

## Project Overview
  
The ZkThunder project includes two setup directories, next to the main implementation of zero-knowledge proof based Mintlayer blockchain service :

- `setup/local`: Containing the docker-compose file that organizes the entire project and other necessary configuration files (e.g., explorer json) for blockchain.
- `setup/test`: Some test scripts and contracts for developers to deploy and call the contracts on the blockchain.
  
Following are the core components of ZkThunder project:
  
- **4EVERLAND**: A holistic storage network compatible with IPFS. We use it as an IPFS-like storage system to save all the blockchain batch information.
- **Mintlayer node and RPC wallet**: A Mintlayer node and a wallet should be deployed locally since the ZkThunder server will interact with it.
- **ZkThunder Docker Images**: The ZkThunder server and other necessary services (explorer, reth node, etc.) are running in docker-compose cluster.
  
## Dependencies
  
This is a shorter version of the setup guide to make it easier for subsequent initializations. If it's the first time you're initializing the workspace, it's recommended that you read the whole guide below, as it provides more context and tips.
If you run on 'clean' Ubuntu on GCP:
  
```sh
# Rust
curl  --proto  '=https'  --tlsv1.2  -sSf  https://sh.rustup.rs | sh
# NVM
curl  -o-  https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
# All necessary stuff
sudo  apt-get  update
sudo  apt-get  install  build-essential  pkg-config  cmake  clang  lldb  lld  libssl-dev  postgresql  apt-transport-https  ca-certificates  curl  software-properties-common
# Install docker
curl  -fsSL  https://download.docker.com/linux/ubuntu/gpg | sudo  apt-key  add  -
sudo  add-apt-repository  "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
sudo  apt  install  docker-ce
sudo  usermod  -aG  docker ${USER}
# Stop default postgres (as we'll use the docker one)
sudo  systemctl  stop  postgresql
sudo  systemctl  disable  postgresql
# Start docker.
sudo  systemctl  start  docker
# You might need to re-connect (due to usermod change).
# Node & yarn
nvm  install  20
# Important: there will be a note in the output to load
# new paths in your local session, either run it or reload the terminal.
npm  install  -g  yarn
yarn  set  version  1.22.19
# For running unit tests
cargo  install  cargo-nextest
# SQL tools
cargo  install  sqlx-cli  --version  0.8.0
```
  
## Build
  
### Environment and Initialization
  
First, you shall set the environment variable in ZkThunder directory, in a terminal do:
  
```sh
export ZKSYNC_HOME=`pwd` 

export PATH=$ZKSYNC_HOME/bin:$PATH
```

Then, use the built-in 'zk-tools' to initialize the project. In the same terminal, run:
  
```sh
ZKSYNC_HOME=`pwd`  PATH=$ZKSYNC_HOME/bin:$PATH  zk 

ZKSYNC_HOME=`pwd`  PATH=$ZKSYNC_HOME/bin:$PATH  zk  init
```

After doing this, you can also use the following command to start or stop the existing docker container:  

```sh
ZKSYNC_HOME=`pwd`  PATH=$ZKSYNC_HOME/bin:$PATH  zk  up 

ZKSYNC_HOME=`pwd`  PATH=$ZKSYNC_HOME/bin:$PATH  zk  down
```

### Build Images
  
Now you can build docker images over a initialized ZkThunder project:
  
```sh
ZKSYNC_HOME=`pwd`  PATH=$ZKSYNC_HOME/bin:$PATH  zk  docker  build  server-v2  --custom-tag  "ZkThunder" 

ZKSYNC_HOME=`pwd`  PATH=$ZKSYNC_HOME/bin:$PATH  zk  docker  build  local-node  --custom-tag  "ZkThunder"
```
  
The built images will be used in the docker-compose cluster, and make sure you have built the server-v2 image at first. Otherwise the local-node image will fail.
  
## Deploy
### Mintlayer Node Deployment
### Mintlayer Node Deployment

To run the ZkThunder project, you need a Mintlayer node and a RPC wallet running locally. There are two main methods to set this up: using cargo directly or using Docker Compose.

#### Method 1: Using Cargo

If you have an official version of mintlayer-core, run the following commands in the mintlayer-core directory:

```sh
# Run a node daemon
cargo run --release --bin node-daemon -- testnet 2>&1 | tee ../mintlayer.log

# Run a RPC wallet daemon (in another terminal)
cargo run --release --bin wallet-rpc-daemon -- testnet --wallet-file <PATH_TO_WALLET> --rpc-username <USER> --rpc-password <PASS> 2>&1 | tee ../wallet-cli.log
```

Make sure to replace `<PATH_TO_WALLET>`, `<USER>`, and `<PASS>` with your actual wallet file path, username, and password respectively.

Important notes:

1. The `--wallet-file` option specifies the wallet file to operate on. You can set this via the environment variable `ML_TESTNET_WALLET_RPC_DAEMON_WALLET_FILE`.

2. It's recommended to set a username and password for RPC authentication:
   - Use `--rpc-username` to set the username (can be set via `ML_TESTNET_WALLET_RPC_DAEMON_RPC_USERNAME` env var)
   - Use `--rpc-password` to set the password (can be set via `ML_TESTNET_WALLET_RPC_DAEMON_RPC_PASSWORD` env var)

3. If you don't set a username and password, a cookie file will be created for authentication.

4. Alternatively, you can use `--rpc-no-authentication` to run the wallet service without RPC authentication, but this is not recommended for security reasons.

#### Method 2: Using Docker Compose

For a more containerized approach, you can use Docker Compose. Here's an example `docker-compose.yml` file:

```yaml
services:
  node-daemon:
    image: "mintlayer/node-daemon:latest"
    command: "node-daemon testnet"
    environment:
      RUST_LOG: "info"
      ML_USER_ID: "1000"
      ML_GROUP_ID: "1000"
      ML_TESTNET_NODE_RPC_BIND_ADDRESS: "0.0.0.0:13030"
      ML_TESTNET_NODE_P2P_BIND_ADDRESSES: "0.0.0.0:44311"
      ML_TESTNET_NODE_RPC_USERNAME: "node_rpc_user"
      ML_TESTNET_NODE_RPC_PASSWORD: "ay_2Gm}NL+O+$c(tqJk:" # WARNING: Change this password before using in production
    ports:
      - "127.0.0.1:13030:13030"
      - "44311:44311"
    volumes:
      - "./mintlayer-data:/home/mintlayer"

  wallet-rpc-daemon:
    image: "mintlayer/wallet-rpc-daemon:latest"
    command: "wallet-rpc-daemon testnet"
    depends_on:
      - "node-daemon"
    environment:
      RUST_LOG: "info"
      ML_USER_ID: "1000"
      ML_GROUP_ID: "1000"
      ML_TESTNET_WALLET_RPC_DAEMON_NODE_RPC_ADDRESS: "node-daemon:13030"
      ML_TESTNET_WALLET_RPC_DAEMON_NODE_RPC_USERNAME: "node_rpc_user"
      ML_TESTNET_WALLET_RPC_DAEMON_NODE_RPC_PASSWORD: "ay_2Gm}NL+O+$c(tqJk:" # WARNING: Change this password before using in production
      ML_TESTNET_WALLET_RPC_DAEMON_RPC_BIND_ADDRESS: "0.0.0.0:3034"
      ML_TESTNET_WALLET_RPC_DAEMON_RPC_USERNAME: "wallet_rpc_user"
      ML_TESTNET_WALLET_RPC_DAEMON_RPC_PASSWORD: "ceQd;;CIO60{FYd<odu]"
    ports:
      - "127.0.0.1:3034:3034"
    volumes:
      - "./mintlayer-data:/home/mintlayer"

  wallet-cli:
    image: "mintlayer/wallet-cli:latest"
    command: "wallet-cli testnet"
    depends_on:
      - "node-daemon"
    environment:
      RUST_LOG: "info"
      ML_USER_ID: "1000"
      ML_GROUP_ID: "1000"
      ML_TESTNET_WALLET_NODE_RPC_ADDRESS: "node-daemon:13030"
      ML_TESTNET_WALLET_NODE_RPC_USERNAME: "node_rpc_user"
      ML_TESTNET_WALLET_NODE_RPC_PASSWORD: "ay_2Gm}NL+O+$c(tqJk:" # WARNING: Change this password before using in production
    volumes:
      - "./mintlayer-data:/home/mintlayer"
    profiles:
      - "wallet_cli"
```

To use this Docker Compose setup:

1. Save the above content in a file named `docker-compose.yml` in your project directory.
2. Make sure Docker and Docker Compose are installed on your system.
3. Open a terminal in the directory containing the `docker-compose.yml` file.
4. Run the following command to start the services:

   ```
   docker-compose up -d
   ```

   This will start the node-daemon and wallet-rpc-daemon services in detached mode.

5. To use the wallet-cli, you can run:

   ```
   docker-compose --profile wallet_cli run wallet-cli
   ```

Remember to change the passwords in the Docker Compose file before using it in a production environment.

Whichever method you choose, ensure you're using a wallet with sufficient funds to send transactions for your project.

### ZkThunder Docker Deployment
  
To deploy the ZkThunder service, just run the scripts in the local-setup directory, make sure that there are no other related container running:
  
```sh
cd ../local-setup 

sudo  ./start.sh
```
  
The script will bootstrap a docker cluster, which contains a complete ZkThunder running  service. If it works, you may see the output in terminal like this, which means the docker cluster is running normally:
  
```sh
... 
ZkThunder-1| 2024-08-01T07:25:32.922492Z   INFO  loop_iteration{l1_block_numbers=L1BlockNumbers  {  safe:  L1BlockNumber(847),  finalized:  L1BlockNumber(847),  latest:  L1BlockNumber(848) }}:  zksync_eth_sender::eth_tx_manager:  Loop  iteration  at  block  848 
ZkThunder-1| 2024-08-01T07:25:32.923338Z   INFO  loop_iteration{l1_block_numbers=L1BlockNumbers  {  safe:  L1BlockNumber(847),  finalized:  L1BlockNumber(847),  latest:  L1BlockNumber(848) }}:  zksync_eth_sender::eth_tx_manager:  Sending  tx  38  at  block  848  with  base_fee_per_gas  1,  priority_fee_per_gas  1000000000,  blob_fee_per_gas  None 
...
```

Or you want to run ZkThunder in background, just modify the `./local-setup/start.sh` script, plus -d at the end of command:
  
```sh
# In ./start.sh 
# docker compose up  
docker  compose  up  -d
```

To stop the ZkThunder docker service, run:
  
```sh
cd  ../local-setup 

sudo  ./clear.sh
```
  
### ZkThunder Test
  
With a running ZkThunder docker cluster and a local Mintlayer node(as well as open wallet), you can do tests of deploying contracts and calling contracts by provided scripts. But first, you need to install the dependencies:
  
```sh
cd  ./local-setup-test 
# This command will install dependencies  
yarn
```
  
There are three example testing scripts and a contract in the directory.
  
- local-setup-test/contracts

1. **Greeter.so**. A solidity smart contract does nothing but greeting.

- local-setup-test/scripts

1. **run.ts** . A script of deploying a contract and calling a contract for 50 times.

2. **run-many-users.ts** . A script for a list of addresses(10 rich wallets) of deploying a contract and calling a contract for 10 times.

- local-setup-test/test

1. **main.test.ts** . A script of deploying a contract and calling a contract for 10 times.

To run the various tests, follow the below command:
  
```sh
# simply run main.test.ts
yarn  test 
# run run.ts with hardhat  
NODE_ENV=test  npx  hardhat  run  ./scripts/run.ts 
# run run-many-user.ts with multi-address  
sudo  bash  ./bandwidth.sh
```
  
The configuration of hardhat, including the endpoints of local tests, is in file ./local-setup-test/hardhat.config.ts

### Rich Wallets
  
The tests always need some rich wallet addresses, with large amounts of ETH on both L1 and L2. you can find it in `./local-setup/rich-wallets.json`
  
Also, during the initial bootstrapping of the system, several ERC-20 contracts are deployed locally. Note, that large quantities of these ERC-20 belong to the wallet`0x36615Cf349d7F6344891B1e7CA7C72883F5dc049`(the first one in the list of the rich wallet). Right after bootstrapping the system, these ERC-20 funds are available only on L1.

## Docker-compose Configuration
  
Now let’s make a deep dive into the docker-compose.yaml to see how the ZkThunder work.
  
This docker compose is setting up the full ZkThunder network, consisting of:
  
- L1 (private reth) with explorer (blockscout)

- a single postgres (with all the databases)

- L2 ZkThunder chain, together with its explorer

- hyperexplorer to merge L1, L2 all together.

For the ports setting:
  
- hyperexplorer:

1. <http://localhost:15000> - http
  
- L1 chain:

1. 15045 - http
  
- L1 explorer

1. <http://localhost:15001> - http
  
- L2 chain (ZkThunder):

1. <http://localhost:15100> - http rpc
2. <http://localhost:15101> - ws rpc
  
- L2 explorer:

1. <http://localhost:15005> - http
2. 3020 - explorer api
3. 15103 - explorer worker
4. 15104 - explorer data-fetcher
5. 15105 - explorer api metrics
  
In this section, we focus on introducing the services named proxy-relay and ZkThunder, see their settings in docker-compose.yaml below:

```yaml
# ZkThunder
  
proxy-relay:  
    image: alpine/socat:latest  
    network_mode: host  
    command: TCP-LISTEN:13034,fork,bind=host.docker.internal       TCP-CONNECT:127.0.0.1:13034  
    extra_hosts:  
      - host.docker.internal:host-gateway  

 ZkThunder:  
    stdin_open: true  
    tty: true  
    image: matterlabs/local-node:${INSTANCE_TYPE:-ZkThunder}  
    healthcheck:  
      test: curl --fail http://localhost:3071/health || exit 1  
      interval: 10s  
      timeout: 5s  
      retries: 200  
      start_period: 30s  
    environment:  
      - DATABASE_PROVER_URL=postgresql://postgres:notsecurepassword@postgres:5432/prover_local  
      - DATABASE_URL=postgresql://postgres:notsecurepassword@postgres:5432/zksync_local  
      - ETH_CLIENT_WEB3_URL=http://reth:8545  
      - LEGACY_BRIDGE_TESTING=1  
      # - IPFS_API_URL=http://ipfs:5001  
      - ML_RPC_URL=http://host.docker.internal:13034 # change to mainnet if needed  
      - ML_BATCH_SIZE=10 # change if necessary  
      - 4EVERLAND_API_KEY=5F2R8SK2EQNSNCHSRWIK # only for test  
      - 4EVERLAND_SECRET_KEY=sCGfIdQZfis8YVCXnQP53SL8cPdRxyzjPLh1KYmF # only for test  
      - 4EVERLAND_BUCKET_NAME=ZkThunder # only for test  
    ports:  
      - 15100:3050 # JSON RPC HTTP port  
      - 15101:3051 # JSON RPC WS port  
    depends_on:  
      - reth  
      - postgres  
      - proxy-relay  
    volumes:  
      - shared_config:/etc/env/target
      - shared_tokens:/etc/tokens 
    extra_hosts:  
      - host.docker.internal:host-gateway
  
```
  
The proxy-relay service forwards the request inside the docker to the local address on the machine, so the service inside the docker can access the Mintlayer network.
  
In ZkThunder’s environment settings:
  
- **ML_RPC_URL** stands for the RPC wallet port of Mintlayer.

- **ML_BATCH_SIZE** controls the frequency of sending data to Mintlayer.

- **4EVERLAND_API_KEY, 4EVERLAND_SECRET_KEY, 4EVERLAND_BUCKET_NAME** these three variables stand for a specific bucket on 4everland, we upload the block information to it.

Next section we will provide a detailed explanation of how we deal with the data storage on 4everland.
  
## 4EVERLAND Storage

There are three types of L2 batches, named Commit, Prove and Execute. Each batch will include block metadata, state root, system log, ZK proofs etc. We fetch the data of each batch, and send it to a specific 4everland bucket.
  
```rust
// put this document to 4everland/ipfs
  
let response_data = bucket  
      .put_object_stream(&mut contents, ipfs_doc_name.clone())  
      .await  
      .unwrap();  
tracing::info!( "put {} to ipfs and get response code: {:?}",  
                ipfs_doc_name,  
                response_data.status_code()  
                );
```

Note that three batches is related to one block. And every time we add a batch’s data to the 4everland bucket, the storage network will respond with an ipfs hash value. We collect such value until the number of responses reach the threshold of **BATCH_SIZE*3**.
  
Then, we upload these all hash values as a file to 4everland storage:
  
```rust
  
// if block_number reaches the BATCH_SIZE, report the hashes to ipfs and then mintlayer  
let batch_size: usize = env::var("ML_BATCH_SIZE")  
                        .ok()  
                        .and_then(|v| v.parse().ok())  
                        .unwrap_or(10  as  usize); 
  
// the number of aggregated operations for mintlayer, default to 10
  
…
  
```

```rust
let root_hash: Option<String> = if  self.ipfs_hash_queue.len() == hash_queue_limit {  
 let title = format!(  
                    "batch_{}_{}",  
                    self.ipfs_hash_queue[0],  
                    self.ipfs_hash_queue.last().unwrap()  
                    );  
 let contents = self.ipfs_hash_queue.clone();  
 let  mut data = Cursor::new(serde_json::to_string(&contents).unwrap());  

 // put this document to 4everland/ipfs  
 let response_data = bucket  
                .put_object_stream(&mut data, title.clone())  
                .await  
                .unwrap();  
 tracing::info!("put hashes {} to ipfs and get response code: {:?}",  
                title,  
                response_data.status_code()  
            );
...
}
```

As before, the 4everland ipfs network will return a hash value, which stands for our file that stores all ipfs hashs of batch information. We choose to save this “overall” root hash value to Mintlayer network, use a `address_deposit_data` method:

```rust
if root_hash.is_some() {  
 // mintlayer  
 let mintlayer_rpc_url = env::var("ML_RPC_URL").unwrap();  
 let mintlayer_client = Client::new();  
 let headers = {  
 let mut headers = reqwest::header::HeaderMap::new();  
                headers.insert("Content-Type", "application/json".parse().unwrap());  
                headers  
            };  

 // add the digest to mintlayer  
 let payload = json!({  
                        "method": "address_deposit_data",  
                        "params": {  
                            "data": hex::encode(root_hash.unwrap()), 
                            // try to convert the hash to hex string according to ASCII  
                            "account": 0, // default to use account 0  
                            "options": {}  
                        },  
                        "jsonrpc": "2.0",  
                        "id": 1,  
                    });  
 let response = mintlayer_client  
                .post(&mintlayer_rpc_url)  
                .headers(headers)  
                .json(&payload)  
                .send()  
                .await  
                .unwrap();
  
…}
  
```
  
## Development
  
One can easily develop his/her own ZkThunder service by modifying the ZkThunder code. The following command may help you quickly run the service:  

```sh
# enable zk tools
ZKSYNC_HOME=`pwd`  PATH=$ZKSYNC_HOME/bin:$PATH  zk 
# init the project  
ZKSYNC_HOME=`pwd`  PATH=$ZKSYNC_HOME/bin:$PATH  zk  init 
# start the docker container  
ZKSYNC_HOME=`pwd`  PATH=$ZKSYNC_HOME/bin:$PATH  zk  up 
# start the ZkThunder server  
ZKSYNC_HOME=`pwd`  PATH=$ZKSYNC_HOME/bin:$PATH  zk  server 
# stop the ZkThunder container  
ZKSYNC_HOME=`pwd`  PATH=$ZKSYNC_HOME/bin:$PATH  zk  down 
# clean all the generated stuff by zk init  
ZKSYNC_HOME=`pwd`  PATH=$ZKSYNC_HOME/bin:$PATH  zk  clean  --all
```
