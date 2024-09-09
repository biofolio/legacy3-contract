use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod event;
pub mod instructions;
pub mod state;
pub mod utils;

pub use instructions::*;
pub use state::*;

#[cfg(not(feature = "devnet"))]
declare_id!("3KMevqDU8As9FLQEqJQheLXUKAXoHZW5D2KfangLu3CY"); // mainnet - TODO: update program id on mainnet

#[cfg(feature = "devnet")]
declare_id!("3KMevqDU8As9FLQEqJQheLXUKAXoHZW5D2KfangLu3CY"); // dev

pub mod admin {
    use anchor_lang::prelude::declare_id;
    #[cfg(not(feature = "devnet"))]
    declare_id!("6UuZRxtnqQJqtTy98gAZGbg59TF5VyNETPxnubQgXwso"); // mainnet - TODO: update admin on mainnet
    #[cfg(feature = "devnet")]
    declare_id!("6UuZRxtnqQJqtTy98gAZGbg59TF5VyNETPxnubQgXwso"); // devnet
}

#[program]
pub mod legacy3 {

    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        connection_fee: u64,
        price: u64,
    ) -> Result<()> {
        handler_initialize_config(ctx, connection_fee, price)
    }

    pub fn update_config(
        ctx: Context<UpdateConfig>,
        connection_fee: Option<u64>,
        price: Option<u64>,
    ) -> Result<()> {
        handler_update_config(ctx, connection_fee, price)
    }

    pub fn set_role(ctx: Context<SetRole>, role: Role, active: bool) -> Result<()> {
        handler_set_role(ctx, role, active)
    }

    pub fn pay_connection_fee(ctx: Context<PayConnectionFee>, sol_amount: u64) -> Result<()> {
        handler_pay_connection_fee(ctx, sol_amount)
    }

    pub fn claim_connection_fee(ctx: Context<ClaimConnectionFee>) -> Result<()> {
        handler_claim_connection_fee(ctx)
    }

    pub fn refund_connection_fee(ctx: Context<RefundConnectionFee>) -> Result<()> {
        handler_refund_connection_fee(ctx)
    }

    pub fn initialize_collection<'info>(
        ctx: Context<'_, '_, '_, 'info, InitializeCollection<'info>>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        handler_initialize_collection(ctx, name, symbol, uri)
    }

    pub fn mint_nft<'info>(
        ctx: Context<'_, '_, '_, 'info, MintNft<'info>>,
        name: String,
        symbol: String,
        uri: String,
        price: u64,
    ) -> Result<()> {
        handler_mint_nft(ctx, name, symbol, uri, price)
    }

    pub fn donate(ctx: Context<Donate>, sol_amount: u64) -> Result<()> {
        handler_donate(ctx, sol_amount)
    }
}
