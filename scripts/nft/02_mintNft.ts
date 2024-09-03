import * as anchor from '@coral-xyz/anchor';
import { Legacy3, EXPO, DEVNET } from '../../sdk';
import { createAndSendV0Tx } from '../../sdk/utils';

// const rpc = '';
const rpc =
  'https://divine-compatible-gas.solana-devnet.quiknode.pro/a87fea433fe4bef41c0b33281901aaad7d027214/';

// const owner = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(require('../../deployer.json'))); // mainnet
const user1 = anchor.web3.Keypair.fromSecretKey(
  Uint8Array.from(require('../.keys/user1.json')),
); // devnet

(async () => {
  const connection = new anchor.web3.Connection(rpc);

  const legacy3 = new Legacy3(connection, DEVNET.PROGRAM_ID);

  const name = 'Justin8129';
  const symbol = 'LEGACY3';
  const uri = '';

  const ix = await legacy3.mintNft(user1.publicKey, name, symbol, uri);

  const computeIxs = [
    anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
      units: 1_000_000,
    }),
    anchor.web3.ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1,
    }),
  ];

  // Step 3 - Generate a transaction and send it to the network
  const { txHash } = await createAndSendV0Tx(
    connection,
    user1,
    [user1],
    [...computeIxs, ix],
    [],
    true,
  );
  console.log('Transaction hash:', txHash);
})();
