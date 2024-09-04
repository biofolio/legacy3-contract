import * as anchor from '@coral-xyz/anchor';
import { Legacy3, EXPO, DEVNET } from '../sdk';
import { createAndSendV0Tx } from '../sdk/utils';

// const rpc = '';
const rpc =
  'https://divine-compatible-gas.solana-devnet.quiknode.pro/a87fea433fe4bef41c0b33281901aaad7d027214/';

// const owner = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(require('../../deployer.json'))); // mainnet
const user1 = anchor.web3.Keypair.fromSecretKey(
  Uint8Array.from(require('./.keys/user1.json')),
); // devnet

const user2 = anchor.web3.Keypair.fromSecretKey(
  Uint8Array.from(require('./.keys/user2.json')),
); // devnet

(async () => {
  const connection = new anchor.web3.Connection(rpc);

  const legacy3 = new Legacy3(connection, DEVNET.PROGRAM_ID);

  const solAmount = 0.05 * anchor.web3.LAMPORTS_PER_SOL; // 0.5 sol

  const ix = await legacy3.donateSol(
    user1.publicKey, // sender
    user2.publicKey, // receiver
    new anchor.BN(solAmount),
  );

  // Step 3 - Generate a transaction and send it to the network
  const { txHash } = await createAndSendV0Tx(
    connection,
    user1.publicKey,
    [user1],
    [ix],
    [],
    true,
  );
  console.log('Transaction hash:', txHash);
})();
