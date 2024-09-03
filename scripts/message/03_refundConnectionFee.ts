import * as anchor from '@coral-xyz/anchor';
import { Legacy3, EXPO, DEVNET } from '../../sdk';
import { createAndSendV0Tx } from '../../sdk/utils';
import { getConnectionPubKey } from '../../sdk/pda';

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

  const connectionPubkey = getConnectionPubKey(
    legacy3.program,
    user1.publicKey,
    user2.publicKey,
  );

  const ix = await legacy3.refundConnectionFee(operator.publicKey, connectionPubkey);

  // Step 3 - Generate a transaction and send it to the network
  const { txHash } = await createAndSendV0Tx(
    connection,
    operator.publicKey,
    [operator],
    [ix],
    [],
    true,
  );
  console.log('Transaction hash:', txHash);
})();
