use anchor_lang::prelude::*;

#[error_code]
pub enum CustomError {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid fee wallet")]
    InvalidFeeWallet,
    #[msg("Invalid treasury")]
    InvalidTreasury,
    #[msg("Connection fee too high")]
    ConnectionFeeTooHigh,
    #[msg("Connection price")]
    InvalidPrice,
    #[msg("Invalid connection status")]
    InvalidConnectionStatus,
    #[msg("Invalid sol amount")]
    InvalidSolAmount,
    #[msg("Collection already initialized")]
    CollectionAlreadyInitialized,
}
