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

const feeWallet = anchor.web3.Keypair.fromSecretKey(
  Uint8Array.from(require('../.keys/fee.json')),
);

const treasury = anchor.web3.Keypair.fromSecretKey(
  Uint8Array.from(require('../.keys/treasury.json')),
);

(async () => {
  const connection = new anchor.web3.Connection(rpc);

  const legacy3 = new Legacy3(connection, DEVNET.PROGRAM_ID);

  const nftPrice = 0.5 * anchor.web3.LAMPORTS_PER_SOL; // 0.5 sol
  const connectionFee = 1000; // 1%

  const ix = await legacy3.initializeConfig(
    owner.publicKey,
    treasury.publicKey,
    feeWallet.publicKey,
    new anchor.BN(nftPrice),
    new anchor.BN(connectionFee),
  );

  // Step 3 - Generate a transaction and send it to the network
  const { txHash } = await createAndSendV0Tx(
    connection,
    owner.publicKey,
    [owner],
    [ix],
    [],
    true,
  );
  console.log('Transaction hash:', txHash);
})();
