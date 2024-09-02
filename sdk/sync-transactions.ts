export const parseInitializeConfig = (events: any[]) => {
  return events
    .filter((event) => event?.name === 'initializeConfigEvent')
    .map((event) => {
      const data = event?.data;
      return {
        event_name: event.name,
        version: data?.version,
        config: data?.config?.toString(),
        admin: data?.admin?.toString(),
        fee_wallet: data?.feeWallet?.toString(),
        connection_fee: data?.connectionFee.toNumber(),
        tx_hash: event?.signature?.toString(),
        block_number: event.blockTime,
      };
    });
};

export const parseUpdateConfig = (events: any[]) => {
  return events
    .filter((event) => event?.name === 'updateConfigEvent')
    .map((event) => {
      const data = event?.data;
      return {
        event_name: event.name,
        version: data?.version,
        config: data?.config?.toString(),
        admin: data?.admin?.toString(),
        fee_wallet: data?.feeWallet?.toString(),
        connection_fee: data?.connectionFee?.toNumber(),
        tx_hash: event?.signature?.toString(),
        block_number: event.blockTime,
      };
    });
};

export const parseSetRole = (events: any[]) => {
  return events
    .filter((event) => event?.name === 'setRoleEvent')
    .map((event) => {
      const data = event?.data;
      return {
        event_name: event.name,
        user: data?.user.toString(),
        role: Object.keys(data?.role)[0],
        active: data?.active,
        config: data?.config?.toString(),
        tx_hash: event?.signature?.toString(),
        block_number: event.blockTime,
      };
    });
};

export const parsePayConnectFee = (events: any[]) => {
  return events
    .filter((event) => event?.name === 'payConnectFeeEvent')
    .map((event) => {
      const data = event?.data;
      return {
        event_name: event.name,
        version: data?.version,
        connection: data?.connection?.toString(),
        connection_vault: data?.connectionVault?.toString(),
        sender: data?.sender?.toString(),
        receiver: data?.receiver?.toString(),
        sol_amount: data?.solAmount?.toString(),
        connection_status: Object.keys(data?.connectionStatus)[0],
        tx_hash: event?.signature?.toString(),
        block_number: event.blockTime,
      };
    });
};

export const parseClaimConnectFee = (events: any[]) => {
  return events
    .filter((event) => event?.name === 'claimConnectFeeEvent')
    .map((event) => {
      const data = event?.data;
      return {
        event_name: event.name,
        version: data?.version,
        connection: data?.connection?.toString(),
        sender: data?.sender?.toString(),
        receiver: data?.receiver?.toString(),
        sol_amount: data?.solAmount?.toString(),
        connection_status: Object.keys(data?.connectionStatus)[0],
        tx_hash: event?.signature?.toString(),
        block_number: event.blockTime,
      };
    });
};

export const parseRefundConnectFee = (events: any[]) => {
  return events
    .filter((event) => event?.name === 'refundConnectFeeEvent')
    .map((event) => {
      const data = event?.data;
      return {
        event_name: event.name,
        version: data?.version,
        connection: data?.connection?.toString(),
        operator: data?.operator?.toString(),
        sender: data?.sender?.toString(),
        sol_amount: data?.solAmount?.toString(),
        connection_status: Object.keys(data?.connectionStatus)[0],
        tx_hash: event?.signature?.toString(),
        block_number: event.blockTime,
      };
    });
};

export const parseInitializeCollection = (events: any[]) => {
  return events
    .filter((event) => event?.name === 'initializeCollectionEvent')
    .map((event) => {
      const data = event?.data;
      return {
        event_name: event.name,
        version: data?.version,
        collection: data?.collection?.toString(),
        owner: data?.owner?.toString(),
        config_account: data?.configAccount?.toString(),
        collection_name: data?.collectionName?.toString(),
        collection_symbol: data?.collectionSymbol?.toString(),
        collection_uri: data?.collectionUri?.toString(),
        tx_hash: event?.signature?.toString(),
        block_number: event.blockTime,
      };
    });
};

export const parseMintNft = (events: any[]) => {
  return events
    .filter((event) => event?.name === 'mintNftEvent')
    .map((event) => {
      const data = event?.data;
      return {
        event_name: event.name,
        version: data?.version,
        mint_address: data?.mintAddress?.toString(),
        user: data?.user?.toString(),
        config_account: data?.configAccount?.toString(),
        nft_name: data?.nftName?.toString(),
        nft_symbol: data?.nftSymbol?.toString(),
        nft_uri: data?.nftUri?.toString(),
        price: data?.price?.toString(),
        tx_hash: event?.signature?.toString(),
        block_number: event.blockTime,
      };
    });
};
