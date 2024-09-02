use anchor_lang::prelude::*;

use crate::{state::Role, ConnectionStatus};

#[event]
pub struct InitializeConfigEvent {
    pub version: u8,
    pub config: Pubkey,
    pub admin: Pubkey,
    pub treasury: Pubkey,
    pub fee_wallet: Pubkey,
    pub connection_fee: u64,
}

#[event]
pub struct UpdateConfigEvent {
    pub version: u8,
    pub config: Pubkey,
    pub admin: Pubkey,
    pub fee_wallet: Pubkey,
    pub connection_fee: u64,
}

#[event]
pub struct SetRoleEvent {
    pub user: Pubkey,
    pub role: Role,
    pub active: bool,
    pub config: Pubkey,
}

#[event]
pub struct PayConnectFeeEvent {
    pub version: u8,
    pub connection: Pubkey,
    pub connection_vault: Pubkey,
    pub sender: Pubkey,
    pub receiver: Pubkey,
    pub sol_amount: u64,
    pub connection_status: ConnectionStatus,
}

#[event]
pub struct ClaimConnectFeeEvent {
    pub version: u8,
    pub connection: Pubkey,
    pub sender: Pubkey,
    pub receiver: Pubkey,
    pub sol_amount: u64,
    pub connection_status: ConnectionStatus,
}

#[event]
pub struct RefundConnectFeeEvent {
    pub version: u8,
    pub connection: Pubkey,
    pub operator: Pubkey,
    pub sender: Pubkey,
    pub sol_amount: u64,
    pub connection_status: ConnectionStatus,
}

#[event]
pub struct InitializeCollectionEvent {
    pub collection: Pubkey,
    pub owner: Pubkey,
    pub config_account: Pubkey,
    pub collection_name: String,
    pub collection_symbol: String,
    pub collection_uri: String,
}

#[event]
pub struct MintNftEvent {
    pub mint_address: Pubkey,
    pub user: Pubkey,
    // pub operator: Pubkey,
    pub config_account: Pubkey,
    pub nft_name: String,
    pub nft_symbol: String,
    pub nft_uri: String,
    pub price: u64,
}
