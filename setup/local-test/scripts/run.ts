import { Wallet, Contract, utils } from 'zksync-web3';
import * as hre from 'hardhat';
import { ethers } from 'ethers';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';

const RICH_WALLET_PK = [
    "0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110"
];

async function deployGreeter(deployer: Deployer): Promise<Contract> {
    try {
        console.log('Deploying contract');
        const artifact = await deployer.loadArtifact('Greeter');
        return await deployer.deploy(artifact, ['Hi']);
    } catch (error) {
        console.error('Error deploying contract');
        console.error(error);
        throw new Error('Error deploying contract');
    }
}

async function main() {
    const deployer = new Deployer(hre, new Wallet(RICH_WALLET_PK[0]));

    const depositHandle = await deployer.zkWallet.deposit({
        to: deployer.zkWallet.address,
        token: utils.ETH_ADDRESS,
        amount: ethers.utils.parseEther('0.001'),
    });

    await depositHandle.wait();

    console.log('Funding complete. Deploying contracts...');

    let greeters: Contract[] = [];
    for (let i = 0; i < 50; i++) {
        let greeter = await deployGreeter(deployer);
        greeters.push(greeter);
    }

    console.log(`Successfully deployed ${greeters.length} contracts.`);

    console.log('Invoking contract methods...');

    for (let index = 0; index < 50; index++) {
        const greeter = greeters[index];
        try {
            const setGreetingTx = await greeter.setGreeting(`Hello, world! Greeter ${index}`);
            await setGreetingTx.wait();
            console.log(`Successfully invoked contract ${index}, say ${await greeter.greet()}`);
        } catch (error) {
            console.error(`Error invoking contract ${index}`);
            console.error(error);
        }
    };

    console.log('Successfully invoked all contract methods.');
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