import * as anchor from '@coral-xyz/anchor';
import { Legacy3, EXPO, DEVNET } from '../../sdk';
import { createAndSendV0Tx, createAndSerializeV0Tx, signAndSendTx } from '../../sdk/utils';

// const rpc = '';
const rpc =
  'https://divine-compatible-gas.solana-devnet.quiknode.pro/a87fea433fe4bef41c0b33281901aaad7d027214/';

// const owner = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(require('../../deployer.json'))); // mainnet
const operator = anchor.web3.Keypair.fromSecretKey(
  Uint8Array.from(require('../.keys/operator.json')),
); // devnet

const user1 = anchor.web3.Keypair.fromSecretKey(
  Uint8Array.from(require('../.keys/user1.json')),
); // devnet

const user2 = anchor.web3.Keypair.fromSecretKey(
  Uint8Array.from(require('../.keys/user2.json')),
); // devnet


(async () => {
  const connection = new anchor.web3.Connection(rpc);

  const legacy3 = new Legacy3(connection, DEVNET.PROGRAM_ID);

  const solAmount = 0.5 * anchor.web3.LAMPORTS_PER_SOL; // 0.5 sol

  const ix = await legacy3.payConnectionFee(
    operator.publicKey, // operator
    user1.publicKey, // sender
    user2.publicKey, // receiver
    new anchor.BN(solAmount),
  );

  const { serialized_tx, signatures } = await createAndSerializeV0Tx(
    connection,
    user1.publicKey,
    operator,
    [ix],
    [],
    'finalized',
  );
  // ================= BE used code =================

  // ================= FE used code =================
  const txHash = await signAndSendTx(
    connection,
    serialized_tx,
    signatures,
    undefined, // pass signTransaction function on FE
    [user1],
  );
  console.log('Transaction hash:', txHash);
  // ================= FE used code =================
})();
