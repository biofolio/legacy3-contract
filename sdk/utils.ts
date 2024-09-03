import * as anchor from '@coral-xyz/anchor';
import {
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddressSync,
  NATIVE_MINT,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  createTransferCheckedInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

// import { ed25519 } from '@noble/curves/ed25519';

export const SEND_RPC_TRANSACTIONS_MAINNET = [
  'https://mainnet.block-engine.jito.wtf/api/v1/transactions',
  'https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/transactions',
  'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/transactions',
  'https://ny.mainnet.block-engine.jito.wtf/api/v1/transactions',
  'https://tokyo.mainnet.block-engine.jito.wtf/api/v1/transactions',
];
export const SEND_RPC_TRANSACTIONS_DEVNET = [
  'https://divine-compatible-gas.solana-devnet.quiknode.pro/a87fea433fe4bef41c0b33281901aaad7d027214/',
  'https://api.devnet.solana.com',
];

// export const sign = (message: Parameters<typeof ed25519.sign>[0], secretKey: any) =>
//   ed25519.sign(message, secretKey.slice(0, 32));

export async function accountExist(
  connection: anchor.web3.Connection,
  account: anchor.web3.PublicKey,
): Promise<boolean> {
  try {
    const info = await connection.getAccountInfo(account, 'confirmed');
    if (info == null || info.data.length == 0) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

export async function getNumberDecimals(
  connection: anchor.web3.Connection,
  token: anchor.web3.PublicKey,
): Promise<number> {
  const info = await connection.getParsedAccountInfo(token);
  const result = (info.value?.data as any).parsed.info.decimals as number;
  return result;
}

export async function buildInstructionsWrapSol(
  connection: anchor.web3.Connection,
  user: anchor.web3.PublicKey,
  lamports: number,
) {
  const instructions: anchor.web3.TransactionInstruction[] = [];
  const associatedTokenAccount = getAssociatedTokenAddressSync(
    NATIVE_MINT,
    user,
  );
  try {
    await getAccount(connection, associatedTokenAccount);
  } catch (error: unknown) {
    if (
      error instanceof TokenAccountNotFoundError ||
      error instanceof TokenInvalidAccountOwnerError
    ) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          user,
          associatedTokenAccount,
          user,
          NATIVE_MINT,
        ),
      );
    }
  }
  instructions.push(
    anchor.web3.SystemProgram.transfer({
      fromPubkey: user,
      toPubkey: associatedTokenAccount,
      lamports: lamports,
    }),
    createSyncNativeInstruction(associatedTokenAccount),
  );

  return instructions;
}

export function buildInstructionsUnWrapSol(user: anchor.web3.PublicKey) {
  const instructions: anchor.web3.TransactionInstruction[] = [];
  const userTokenAccount = getAssociatedTokenAddressSync(
    NATIVE_MINT,
    user,
    false,
  );
  instructions.push(
    createCloseAccountInstruction(userTokenAccount, user, user),
  );
  return instructions;
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
export const randomInt = (min: number, max: number) => {
  min = Math.max(1, min);
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const transferToken = async (
  connection: anchor.web3.Connection,
  from: anchor.web3.Keypair,
  to: anchor.web3.PublicKey,
  mint: anchor.web3.PublicKey,
  amount: number,
) => {
  const signerTokenAccount = getAssociatedTokenAddressSync(
    mint,
    from.publicKey,
    false,
  );

  const transaction = new anchor.web3.Transaction();

  const userTokenAccount = getAssociatedTokenAddressSync(mint, to, false);

  try {
    await getAccount(
      connection,
      userTokenAccount,
      'confirmed',
      TOKEN_PROGRAM_ID,
    );
  } catch (e) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        from.publicKey,
        userTokenAccount,
        to,
        mint,
        TOKEN_PROGRAM_ID,
      ),
    );
  }

  const mintDecimals = await getNumberDecimals(connection, mint);

  transaction.add(
    createTransferCheckedInstruction(
      signerTokenAccount,
      mint,
      userTokenAccount,
      from.publicKey,
      amount,
      mintDecimals,
    ),
  );

  const sig = await anchor.web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [from],
  );
  console.log('Transaction signature', sig);
  return sig;
};

export const instructionDataToTransactionInstruction = (
  instructionPayload: any,
) => {
  if (instructionPayload === null) {
    return null;
  }

  return new anchor.web3.TransactionInstruction({
    programId: new anchor.web3.PublicKey(instructionPayload.programId),
    keys: instructionPayload.accounts.map((key: any) => ({
      pubkey: new anchor.web3.PublicKey(key.pubkey),
      isSigner: key.isSigner,
      isWritable: key.isWritable,
    })),
    data: Buffer.from(instructionPayload.data, 'base64'),
  });
};

export const getAddressLookupTableAccounts = async (
  connection: anchor.web3.Connection,
  keys: string[],
): Promise<anchor.web3.AddressLookupTableAccount[]> => {
  const addressLookupTableAccountInfos =
    await connection.getMultipleAccountsInfo(
      keys.map((key) => new anchor.web3.PublicKey(key)),
      'confirmed',
    );

  return addressLookupTableAccountInfos.reduce((acc, accountInfo, index) => {
    const addressLookupTableAddress = keys[index];
    if (accountInfo) {
      const addressLookupTableAccount =
        new anchor.web3.AddressLookupTableAccount({
          key: new anchor.web3.PublicKey(addressLookupTableAddress),
          state: anchor.web3.AddressLookupTableAccount.deserialize(
            accountInfo.data,
          ),
        });
      acc.push(addressLookupTableAccount);
    }

    return acc;
  }, new Array<anchor.web3.AddressLookupTableAccount>());
};

async function sendTransactionRpc(rpc: string, data: string) {
  try {
    const connection = new anchor.web3.Connection(rpc, {
      httpHeaders: {
        'Content-Type': 'application/json',
        Origin: 'https://jup.ag',
        Referrer: 'https://jup.ag',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      },
    });
    const txhash = await connection.sendRawTransaction(
      Buffer.from(data, 'base64'),
      {
        maxRetries: 10,
        skipPreflight: true,
        preflightCommitment: 'processed',
      },
    );
    return txhash;
  } catch (e) {
    console.log(
      `🚀 ~ RpcTransactionService ~ sendTransactionRpc ~ e: ${rpc}`,
      e,
    );
  }
}

export async function sendTransaction(data: string, isMainnet: boolean = true) {
  const SEND_RPC_TRANSACTIONS = isMainnet
    ? SEND_RPC_TRANSACTIONS_MAINNET
    : SEND_RPC_TRANSACTIONS_DEVNET;

  const start = new Date().getTime();
  return new Promise(async (resolve, reject) => {
    try {
      let txhash: string;
      await Promise.all(
        SEND_RPC_TRANSACTIONS.map(async (rpc) => {
          const tx = await sendTransactionRpc(rpc, data);
          if (!txhash) {
            const end = new Date().getTime();
            console.log('🚀 ~ sendTransaction ~ end - start', end - start);
            txhash = tx!!;
            resolve(txhash);
          }
        }),
      );
      const end2 = new Date().getTime();
      console.log('🚀 ~ sendTransaction ~ end2 - start', end2 - start);
    } catch (e) {
      console.log('[sendTransaction] e', e); // console by M-MON
      reject('Send transaction error: ');
    }
  });
}

export async function createAndSendV0Tx(
  connection: anchor.web3.Connection,
  payer: anchor.web3.Keypair,
  signers: anchor.web3.Keypair[],
  txInstructions: anchor.web3.TransactionInstruction[],
  addressLookupTableAccounts?: anchor.web3.AddressLookupTableAccount[],
  confirmed: boolean = false,
  signTransaction?: any,
) {
  // Step 1 - Fetch Latest Blockhash
  try {
    const latestBlockhash = await connection.getLatestBlockhash('finalized');
    console.log(
      '   ✅ - Fetched latest blockhash. Last valid height:',
      latestBlockhash.lastValidBlockHeight,
    );

    // Step 2 - Generate Transaction Message
    const messageV0 = new anchor.web3.TransactionMessage({
      payerKey: payer.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: txInstructions,
    }).compileToV0Message(addressLookupTableAccounts);
    console.log('   ✅ - Compiled transaction message');
    const transaction = new anchor.web3.VersionedTransaction(messageV0);

    // Step 3 - Sign your transaction with the required Signers
    if (signTransaction) {
      await signTransaction(transaction);
    } else {
      transaction.sign([...signers]);
    }
    console.log('   ✅ - Transaction Signed');

    const simulateTx = await connection.simulateTransaction(transaction, {
      sigVerify: true,
      commitment: 'processed',
    });

    if (simulateTx.value.err) {
      console.log(JSON.stringify(simulateTx, null, 2));
    }

    console.log('transaction size', transaction.serialize().length);

    // process.exit();

    // Step 4 - Send our v0 transaction to the cluster
    const txh = Buffer.from(transaction.serialize()).toString('base64');

    const isMainnet = connection.rpcEndpoint.includes('mainnet');

    const txhash = await sendTransaction(txh, isMainnet).catch((e) => {
      console.log(e.getLogs());
      console.log('e', e); // console by M-MON
    });

    // Step 5 - Confirm Transaction
    if (confirmed) {
      const confirmation = await connection.confirmTransaction(
        txhash as string,
        'confirmed',
      );

      // if (confirmation?.value?.err) {
      //   console.log('confirmation.value.err', confirmation.value.err);
      //   return {
      //     message: '❌ Transaction not confirmed.',
      //   };
      // }
    }

    return {
      message: 'Transaction successfully submitted !',
      txHash: txhash as anchor.web3.TransactionSignature,
    };
  } catch (e: any) {
    console.log('[createAndSendV0Tx] [ERROR]', e);
    return {
      message: 'Transaction failed.',
      txHash: '',
    };
  }
}

// export async function createAndSerializeV0Tx(
//   connection: anchor.web3.Connection,
//   signer: anchor.web3.Keypair,
//   txInstructions: anchor.web3.TransactionInstruction[],
//   addressLookupTableAccounts?: anchor.web3.AddressLookupTableAccount[],
//   commitment: anchor.web3.Commitment = 'confirmed',
// ) {
//   // Step 1 - Fetch Latest Blockhash
//   try {
//     const latestBlockhash = await connection.getLatestBlockhash(commitment);
//     console.log('   ✅ - Fetched latest blockhash. Last valid height:', latestBlockhash.lastValidBlockHeight);

//     // Step 2 - Generate Transaction Message
//     const messageV0 = new anchor.web3.TransactionMessage({
//       payerKey: signer.publicKey,
//       recentBlockhash: latestBlockhash.blockhash,
//       instructions: txInstructions,
//     }).compileToV0Message(addressLookupTableAccounts);
//     console.log('   ✅ - Compiled transaction message');
//     const transaction = new anchor.web3.VersionedTransaction(messageV0);

//     const signature = {
//       [signer.publicKey.toString()]: Buffer.from(sign(transaction.message.serialize(), signer.secretKey)).toString(
//         'base64',
//       ),
//     };

//     console.log('transaction size', transaction.serialize().length);

//     // Step 4 - Send our v0 transaction to the cluster
//     const serialized_tx = Buffer.from(transaction.serialize()).toString('base64');

//     return {
//       message: 'Transaction serialized successfully!',
//       serialized_tx,
//       signature,
//     };
//   } catch (e: any) {
//     const onlyDirectRoutes = e?.toString()?.includes('RangeError: encoding overruns Uint8Array');
//     return {
//       message: 'Transaction failed.',
//       onlyDirectRoutes,
//     };
//   }
// }

export const checkIfTokenAccountExists = async (
  connection: anchor.web3.Connection,
  receiverTokenAccountAddress: anchor.web3.PublicKey,
  tokenProgramId: anchor.web3.PublicKey,
) => {
  // Check if the receiver's token account exists
  try {
    await getAccount(
      connection,
      receiverTokenAccountAddress,
      'confirmed',
      tokenProgramId,
    );

    return true;
  } catch (thrownObject) {
    const error = thrownObject as Error;
    if (
      error instanceof TokenAccountNotFoundError ||
      error instanceof TokenInvalidAccountOwnerError
    ) {
      return false;
    }

    throw error;
  }
};
