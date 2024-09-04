import * as anchor from '@coral-xyz/anchor';
// @ts-ignore
import _ from 'lodash';
import { Legacy3Type } from './idl/legacy3';
import IDL from './idl/legacy3.json';
import {
  getConfigPubKey,
  getConfigTokenAccountPubKey,
  getConnectionPubKey,
  getConnectionVaultPubKey,
  getNftMintPubKey,
  getRolePubKey,
} from './pda';
import { Metaplex, PublicKey } from '@metaplex-foundation/js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const MAINNET = {
  CP_LOOKUP_TABLE: '',
  PROGRAM_ID: '',
};

export const DEVNET = {
  CP_LOOKUP_TABLE: '',
  PROGRAM_ID: '3KMevqDU8As9FLQEqJQheLXUKAXoHZW5D2KfangLu3CY',
};

export const EXPO = 100_000;

const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);

export class Legacy3 {
  connection: anchor.web3.Connection;
  program: anchor.Program<Legacy3Type>;
  configPubkey: anchor.web3.PublicKey;
  configData: anchor.IdlAccounts<Legacy3Type>['config'] | null;
  metaplex: Metaplex;

  constructor(
    connection: anchor.web3.Connection,
    programId: string = DEVNET.PROGRAM_ID,
  ) {
    this.connection = connection;
    IDL.address = programId;

    this.program = new anchor.Program(IDL as Legacy3Type, {
      connection: this.connection,
    });

    this.configPubkey = getConfigPubKey(this.program);
    this.configData = null;
    this.metaplex = Metaplex.make(this.connection);
  }

  get programInstance() {
    return this.program;
  }

  async bootstrap(): Promise<void> {
    try {
      this.configData = await this.fetchConfig();
    } catch (error) {
      throw new Error('Config account is not initialize');
    }
  }

  async fetchConfig(
    commitment: anchor.web3.Commitment = 'confirmed',
  ): Promise<anchor.IdlAccounts<Legacy3Type>['config'] | null> {
    try {
      const configPubkey = getConfigPubKey(this.program);
      return await this.program.account.config.fetch(configPubkey, commitment);
    } catch (error) {
      // return default null if config account has not been initialized
    }

    return null;
  }

  async fetchRole(
    user: string,
    commitment: anchor.web3.Commitment = 'confirmed',
  ): Promise<anchor.IdlAccounts<Legacy3Type>['roleAccount'] | null> {
    try {
      const rolePubkey = getRolePubKey(
        this.program,
        getConfigPubKey(this.program),
        new anchor.web3.PublicKey(user),
      );
      return await this.program.account.roleAccount.fetch(
        rolePubkey,
        commitment,
      );
    } catch (error) {
      // return default null if config account has not been initialized
    }

    return null;
  }

  async fetchConnectionWithPubkey(
    connection: string,
    commitment: anchor.web3.Commitment = 'confirmed',
  ): Promise<anchor.IdlAccounts<Legacy3Type>['connection'] | null> {
    try {
      return await this.program.account.connection.fetch(
        connection,
        commitment,
      );
    } catch (error) {
      // return default null if config account has not been initialized
    }

    return null;
  }

  async initializeConfig(
    owner: anchor.web3.PublicKey,
    treasury: anchor.web3.PublicKey,
    feeWallet: anchor.web3.PublicKey,
    nftPrice: anchor.BN,
    connectionFee: anchor.BN,
  ): Promise<anchor.web3.TransactionInstruction> {
    const ix = await this.program.methods
      .initializeConfig(connectionFee, nftPrice)
      .accountsStrict({
        owner,
        config: this.configPubkey,
        treasury,
        feeWallet,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .instruction();
    return ix;
  }

  async updateConfig(
    owner: anchor.web3.PublicKey,
    treasury?: anchor.web3.PublicKey,
    newFeeWallet?: anchor.web3.PublicKey,
    nftPrice?: anchor.BN,
    connectionFee?: anchor.BN,
  ): Promise<anchor.web3.TransactionInstruction> {
    const ix = await this.program.methods
      .updateConfig(connectionFee ?? null, nftPrice ?? null)
      .accountsStrict({
        owner,
        config: this.configPubkey,
        newFeeWallet: newFeeWallet ?? null,
        treasury: treasury ?? null,
      })
      .instruction();
    return ix;
  }

  async setRole(
    owner: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey,
    role: anchor.IdlTypes<Legacy3Type>['role'],
    isActive: boolean,
  ): Promise<anchor.web3.TransactionInstruction> {
    const ix = await this.program.methods
      .setRole(role, isActive)
      .accountsStrict({
        owner,
        user,
        roleAccount: getRolePubKey(this.program, this.configPubkey, user),
        config: this.configPubkey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .instruction();
    return ix;
  }

  async payConnectionFee(
    sender: anchor.web3.PublicKey,
    receiver: anchor.web3.PublicKey,
    solAmount: anchor.BN,
  ): Promise<anchor.web3.TransactionInstruction> {
    const connectionPubkey = getConnectionPubKey(
      this.program,
      sender,
      receiver,
    );
    const ix = await this.program.methods
      .payConnectionFee(solAmount)
      .accountsStrict({
        config: this.configPubkey,
        connection: connectionPubkey,
        connectionVault: getConnectionVaultPubKey(
          this.program,
          connectionPubkey,
        ),
        receiver,
        sender,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .instruction();
    return ix;
  }

  async claimConnectionFee(
    connection: anchor.web3.PublicKey,
  ): Promise<anchor.web3.TransactionInstruction> {
    const connectionData = await this.fetchConnectionWithPubkey(
      connection.toBase58(),
    );
    if (!connectionData) {
      throw new Error(`Connection not found ${connection.toBase58()}`);
    }
    const ix = await this.program.methods
      .claimConnectionFee()
      .accountsStrict({
        config: this.configPubkey,
        connection,
        connectionVault: getConnectionVaultPubKey(this.program, connection),
        receiver: connectionData.receiver,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .instruction();
    return ix;
  }

  async refundConnectionFee(
    operator: anchor.web3.PublicKey,
    connection: anchor.web3.PublicKey,
  ): Promise<anchor.web3.TransactionInstruction> {
    const connectionData = await this.fetchConnectionWithPubkey(
      connection.toBase58(),
    );
    if (!connectionData) {
      throw new Error(`Connection not found ${connection.toBase58()}`);
    }
    const ix = await this.program.methods
      .refundConnectionFee()
      .accountsStrict({
        config: this.configPubkey,
        roleAccount: getRolePubKey(this.program, this.configPubkey, operator),
        connection,
        connectionVault: getConnectionVaultPubKey(this.program, connection),
        operator,
        sender: connectionData.sender,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .instruction();
    return ix;
  }

  async createCollection(
    owner: anchor.web3.PublicKey,
    collectionName: string,
    collectionSymbol: string,
    collectionUri: string,
  ) {
    const collection = anchor.web3.Keypair.generate();
    const configTokenAccount = getConfigTokenAccountPubKey(
      this.program,
      this.configPubkey,
      collection.publicKey,
    );
    const metadataAccount = this.metaplex
      .nfts()
      .pdas()
      .metadata({ mint: collection.publicKey });
    const masterEditionAccount = this.metaplex
      .nfts()
      .pdas()
      .masterEdition({ mint: collection.publicKey });

    const ix = await this.program.methods
      .initializeCollection(collectionName, collectionSymbol, collectionUri)
      .accountsStrict({
        configAccount: this.configPubkey,
        collection: collection.publicKey,
        configTokenAccount: configTokenAccount,
        metadataAccount: metadataAccount,
        masterEditionAccount: masterEditionAccount,
        owner: owner,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .instruction();
    return { ix, collection };
  }

  async mintNft(
    operator: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey,
    name: string,
    symbol: string,
    uri: string,
    price: anchor.BN,
  ): Promise<anchor.web3.TransactionInstruction> {
    if (!this.configData) {
      await this.bootstrap();
    }
    if (!this.configData) {
      throw new Error('Config account is not initialize');
    }
    if (this.configData?.collection.equals(PublicKey.default)) {
      throw new Error('Collection is not initialize');
    }

    // const mint = anchor.web3.Keypair.generate();
    const mint = getNftMintPubKey(this.program, name);

    const mintInfo = await this.connection.getParsedAccountInfo(mint);
    if (mintInfo?.value) {
      throw new Error(`This nft ${name} has been mint - ${mint.toBase58()}`);
    }

    const userTokenAccount = getAssociatedTokenAddressSync(mint, user);

    // const userConfigAccount = this.getUserConfigAccountPubKey(
    //   user,
    //   this.configAccountData.collection,
    // );

    // const userConfigAccountInfo = await this.connection.getAccountInfo(
    //   userConfigAccount,
    // );

    // if (userConfigAccountInfo) {
    //   throw new Error(`This user ${user} has been mint nft`);
    // }

    const roleAccount = getRolePubKey(
      this.program,
      this.configPubkey,
      operator,
    );
    const metadataAccount = this.metaplex
      .nfts()
      .pdas()
      .metadata({ mint: mint });
    //
    const masterEditionAccount = this.metaplex
      .nfts()
      .pdas()
      .masterEdition({ mint: mint });

    const collectionMetadataAccount = this.metaplex
      .nfts()
      .pdas()
      .metadata({ mint: this.configData.collection });
    //
    const collectionMasterEditionAccount = this.metaplex
      .nfts()
      .pdas()
      .masterEdition({ mint: this.configData.collection });

    const remainAccounts: anchor.web3.AccountMeta[] = [
      // {
      //   isSigner: false,
      //   isWritable: true,
      //   pubkey: userConfigAccount,
      // },
      {
        isSigner: false,
        isWritable: true,
        pubkey: collectionMetadataAccount,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: collectionMasterEditionAccount,
      },
    ];
    const ix = await this.program.methods
      .mintNft(name, symbol, uri, price)
      .accountsStrict({
        configAccount: this.configPubkey,
        mint: mint,
        metadataAccount: metadataAccount,
        masterEditionAccount: masterEditionAccount,
        collection: this.configData.collection,
        userTokenAccount: userTokenAccount,
        treasury: this.configData.treasury,
        user: user,
        roleAccount: roleAccount,
        operator: operator,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .remainingAccounts(remainAccounts)
      .instruction();

    return ix;
  }

  async donateSol(
    user: anchor.web3.PublicKey,
    recipient: anchor.web3.PublicKey,
    solAmount: anchor.BN,
  ) {
    const transferIx = anchor.web3.SystemProgram.transfer({
      fromPubkey: user,
      toPubkey: recipient,
      lamports: BigInt(solAmount.toString()),
    });
    return transferIx;
  }

  async watchTransaction(txHash: string) {
    const confirmation = await this.connection.confirmTransaction(
      txHash,
      'confirmed',
    );

    if (confirmation?.value?.err) {
      let attempts = 0;
      while (attempts < 5) {
        try {
          const tx = await this.connection.getParsedTransaction(
            txHash,
            'confirmed',
          );

          if (tx && !tx.meta?.err) {
            return {
              confirmed: true,
              message: '✅ Transaction submitted successfully',
            };
          }

          if (tx && tx?.meta?.err) {
            return {
              confirmed: false,
              message: `❌ Transaction failed. Error: ${tx?.meta?.err}`,
            };
          }
        } catch (e) {}
        attempts++;
        await sleep(2000);
      }

      return {
        confirmed: false,
        message: `❌ Transaction not confirmed`,
      };
    }

    return {
      confirmed: true,
      message: '✅ Transaction confirmed',
    };
  }

  private async _getProgramSignatures(
    untilSignature?: string,
  ): Promise<string[]> {
    const until = untilSignature ? untilSignature : null;
    const confirmedSignatureInfo =
      await this.connection.getSignaturesForAddress(
        this.program.programId,
        // @ts-ignore
        { until: until },
        'confirmed',
      );
    return confirmedSignatureInfo
      .filter((item) => item.err == null)
      .map((item) => item.signature);
  }

  private async _splitTransactions(
    signatures: string[],
  ): Promise<Array<string[]>> {
    let batchSignatures: Array<string[]>;
    if (signatures.length < 10) {
      batchSignatures = [signatures];
    } else {
      batchSignatures = _.chunk(signatures, 10);
    }

    return batchSignatures;
  }

  public async parseTransactions(
    signatures: string[],
  ): Promise<anchor.web3.ParsedTransactionWithMeta[]> {
    const transactions: anchor.web3.ParsedTransactionWithMeta[] = [];
    while (true) {
      try {
        const batchTransactions = await this.connection.getParsedTransactions(
          signatures,
          {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 2,
          },
        );
        // @ts-ignore
        transactions.push(...batchTransactions);
        break;
      } catch (e) {
        console.error(e);
        await sleep(1000);
      }
    }

    return _.flatten(transactions);
  }

  async getTransactions(untilSignature?: string): Promise<{
    data: Array<string[]>;
    latestSignature?: string;
  }> {
    const signatures = await this._getProgramSignatures(untilSignature);
    console.log(`Found ${signatures.length} signatures`);
    return {
      data: signatures.length ? await this._splitTransactions(signatures) : [],
      latestSignature: signatures.length ? signatures[0] : untilSignature,
    };
  }

  parseEvent(transactionParsed: anchor.web3.ParsedTransactionWithMeta) {
    const eventParser = new anchor.EventParser(
      this.program.programId,
      new anchor.BorshCoder(this.program.idl),
    );
    // @ts-ignore
    const events = eventParser.parseLogs(transactionParsed.meta.logMessages);
    const eventsData: any[] = [];
    // @ts-ignore
    for (const event of events) {
      eventsData.push(event);
    }
    return eventsData.map((event) => {
      return {
        ...event,
        blockTime: transactionParsed.blockTime,
        signature: transactionParsed.transaction.signatures[0],
      };
    });
  }

  parseEvents(transactionsParsed: anchor.web3.ParsedTransactionWithMeta[]) {
    const events = transactionsParsed.map((transactionParsed) => {
      return this.parseEvent(transactionParsed);
    });
    return _.flatten(events);
  }
}
