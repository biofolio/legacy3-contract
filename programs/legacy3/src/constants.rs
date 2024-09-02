use anchor_lang::prelude::*;

pub const EXPO: u64 = 100_000;
pub const MAXIMUM_CONNECTION_FEE: u64 = EXPO / 10;

#[constant]
pub const CONFIG_SEED: &[u8] = b"config_seed";

#[constant]
pub const ROLE_SEED: &[u8] = b"role_seed";

#[constant]
pub const CONNECTION_SEED: &[u8] = b"connection_seed";

#[constant]
pub const CONNECTION_VAULT_SEED: &[u8] = b"connection_vault_seed";

#[constant]
pub const CONFIG_TOKEN_SEED: &[u8] = b"config_token_seed";

#[constant]
pub const NFT_MINT_SEED: &[u8] = b"nft_mint_seed";

#[constant]
pub const PREFIX: &str = "metadata";

#[constant]
pub const EDITION: &str = "edition";
