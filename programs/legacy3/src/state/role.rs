use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct RoleAccount {
    /// User pubkey associated with the role
    pub user: Pubkey,
    /// Role of the user
    pub role: Role,
    /// Flag to control if the role is active
    pub active: bool,
    /// Bump to identify PDA
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace, Copy)]
pub enum Role {
    Operator,
    Minter,
}
