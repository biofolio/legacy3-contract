import * as anchor from '@coral-xyz/anchor';
import { Legacy3, EXPO, DEVNET } from '../../sdk';
import { createAndSendV0Tx } from '../../sdk/utils';

// const rpc = '';
const rpc =
  'https://divine-compatible-gas.solana-devnet.quiknode.pro/a87fea433fe4bef41c0b33281901aaad7d027214/';

// const owner = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(require('../../deployer.json'))); // mainnet
const owner = anchor.web3.Keypair.fromSecretKey(
  Uint8Array.from(require('../.keys/owner.json')),
); // devnet

(async () => {
  const connection = new anchor.web3.Connection(rpc);

  const legacy3 = new Legacy3(connection, DEVNET.PROGRAM_ID);

  const collectionName = 'Legacy3 Handle Collection';
  const collectionSymbol = 'LEGACY3';
  const collectionUri = '';

  const { ix, collection } = await legacy3.createCollection(
    owner.publicKey,
    collectionName,
    collectionSymbol,
    collectionUri,
  );

  console.log('Collection:', collection.publicKey.toBase58());

  const computeIxs = [
    anchor.web3.ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 100_000,
    }),
  ];

  // Step 3 - Generate a transaction and send it to the network
  const { txHash } = await createAndSendV0Tx(
    connection,
    owner,
    [owner, collection],
    [...computeIxs, ix],
    [],
    true,
  );
  console.log('Transaction hash:', txHash);
})();
