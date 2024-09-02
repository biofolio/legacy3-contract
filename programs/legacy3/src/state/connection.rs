use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Connection {
    /// Connection version
    pub version: u8,
    /// Bump to identify PDA
    pub bump: u8,
    pub vault_bump: u8,
    pub sender: Pubkey,
    pub receiver: Pubkey,
    pub sol_amount: u64,
    pub status: ConnectionStatus,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace, Copy)]
pub enum ConnectionStatus {
    Opened,
    Connected,
    Refunded,
}
