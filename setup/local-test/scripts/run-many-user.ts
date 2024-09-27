import { Wallet, Contract, utils } from 'zksync-web3';
import * as hre from 'hardhat';
import { ethers } from 'ethers';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';

const RICH_WALLET_PK = [
    "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110",
    "0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3",
    "0xd293c684d884d56f8d6abd64fc76757d3664904e309a0645baf8522ab6366d9e",
    "0x850683b40d4a740aa6e745f889a6fdc8327be76e122f5aba645a5b02d0248db8",
    "0xf12e28c0eb1ef4ff90478f6805b68d63737b7f33abfa091601140805da450d93",
    "0xe667e57a9b8aaa6709e51ff7d093f1c5b73b63f9987e4ab4aa9a5c699e024ee8",
    "0x28a574ab2de8a00364d5dd4b07c4f2f574ef7fcc2a86a197f65abaec836d1959",
    "0x74d8b3a188f7260f67698eb44da07397a298df5427df681ef68c45b34b61f998",
    "0xbe79721778b48bcc679b78edac0ce48306a8578186ffcb9f2ee455ae6efeace1",
    "0x3eb15da85647edd9a1159a4a13b9e7c56877c4eb33f614546d4db06a51868b1c"
];

async function deployGreeter(deployer: Deployer): Promise<Contract> {
    try {
        console.log(`${deployer.ethWallet.address} deploying contract`);
        const artifact = await deployer.loadArtifact('Greeter');
        return await deployer.deploy(artifact, ['Hi']);
    } catch (error) {
        console.error('Error deploying contract');
        console.error(error);
        throw new Error('Error deploying contract');
    }
}

async function main() {

    const index = process.env.INDEX;

    const deployer = new Deployer(hre, new Wallet(RICH_WALLET_PK[index]));

    const depositHandle = await deployer.zkWallet.deposit({
        to: deployer.zkWallet.address,
        token: utils.ETH_ADDRESS,
        amount: ethers.utils.parseEther('0.001'),
    });

    await depositHandle.wait();

    console.log(`Funding complete. User ${RICH_WALLET_PK[index]} Deploying contracts...`);

    let greeters: Contract[] = [];
    for (let i = 0; i < 10; i++) {
        let greeter = await deployGreeter(deployer);
        greeters.push(greeter);
    }

    console.log(`Successfully deployed ${greeters.length} contracts.`);

    // console.log('Invoking contract methods...');

    // for (let index = 0; index < 50; index++) {
    //     const greeter = greeters[index];
    //     try {
    //         const setGreetingTx = await greeter.setGreeting(`Hello, world! Greeter ${index}`);
    //         await setGreetingTx.wait();
    //         console.log(`Successfully invoked contract ${index}, say ${await greeter.greet()}`);
    //     } catch (error) {
    //         console.error(`Error invoking contract ${index}`);
    //         console.error(error);
    //     }
    // };

    // console.log('Successfully invoked all contract methods.');
}

main()
    .then(() => {
        console.log('Deployment script completed successfully.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Deployment script encountered an error:', error);
        process.exit(1);
    });