# local-setup-test

This module is for testing the local-setup of the L2 node by sending a deploy contract transaction to the L2 node.

## Usage

Run `yarn` to install dependencies.

Run `yarn test` to execute the script in the `/test` folder and deploy a `Greeter` Solidity contract on the L2 zkEVM.

After a transaction, the L2 node will batch the transactions and verify them on L1 through the `Commit`, `Prove`, and `Execute` workflow.

Some settings in `hardhat.config.ts`:

```typescript
{
    url: "http://localhost:15100", # The RPC endpoint of L2
    ethNetwork: "http://localhost:15045", # The RPC endpoint of L1
    zksync: true,
}
```

Test L1-L2 transaction:

Make sure to get the correct bridgehub address (in this example: 0x35A3783781DE026E1e854A6DA45d7a903664a9dA) from the hyperexplorer.

```
 cast send -r http://localhost:15045  --private-key 0x27593fea79697e947890ecbecce7901b0008345e5d7259710d0dd5e500d040be 0x9f54A0B0265c22d123E87ffCA25228043f735052 "requestL2TransactionDirect((uint256, uint256, address, uint256, bytes, uint256, uint256, bytes[], address))" "(270,0xde0b6b3a7640000,0x005C43B2063625e9425943Fec65c42d005a2cD1f,10000000000000,"",10000000,800,[0x1234567890123456789012345678901234567890123456789012345678901234],0x005C43B2063625e9425943Fec65c42d005a2cD1f)" --value=1000000000000000000
```

reth: only "reth:v0.2.0-beta.2"
instance-type:

- zkthunder: can deploy contract and transfer
- latest2.0: can transfer
- hyperlocal: can deploy contract and transfer

Transfer will result in server died