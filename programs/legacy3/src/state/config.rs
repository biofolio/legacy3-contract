use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Config {
    /// Config version
    pub version: u8,
    /// Bump to identify PDA
    pub bump: u8,
    pub treasury: Pubkey,
    pub fee_wallet: Pubkey,
    pub collection: Pubkey,
    pub price: u64,
    pub connection_fee: u64,
}
