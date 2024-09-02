use crate::{
    constants::{CONFIG_SEED, MAXIMUM_CONNECTION_FEE},
    errors::CustomError,
    event::UpdateConfigEvent,
    state::Config,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    /// Address to be set as protocol owner.
    #[account(
        mut,
        address = crate::admin::id() @ CustomError::Unauthorized
    )]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, Config>,

    /// CHECK: fee wallet account
    pub new_fee_wallet: Option<AccountInfo<'info>>,

    /// CHECK: this account use to setup treasury
    #[account(constraint = treasury.data_is_empty())]
    pub treasury: Option<AccountInfo<'info>>,
}

pub fn handler_update_config(
    ctx: Context<UpdateConfig>,
    connection_fee: Option<u64>,
    price: Option<u64>,
) -> Result<()> {
    let config = &mut ctx.accounts.config;

    if let Some(fee_wallet) = &ctx.accounts.new_fee_wallet {
        require!(fee_wallet.data_is_empty(), CustomError::InvalidFeeWallet);
        require!(!fee_wallet.executable, CustomError::InvalidFeeWallet);
        require_keys_neq!(
            fee_wallet.key(),
            Pubkey::default(),
            CustomError::InvalidFeeWallet
        );

        config.fee_wallet = fee_wallet.key();
    }

    if let Some(treasury) = &ctx.accounts.new_fee_wallet {
        require!(treasury.data_is_empty(), CustomError::InvalidTreasury);
        require!(!treasury.executable, CustomError::InvalidTreasury);
        require_keys_neq!(
            treasury.key(),
            Pubkey::default(),
            CustomError::InvalidTreasury
        );

        config.treasury = treasury.key();
    }

    if let Some(connection_fee) = connection_fee {
        require_gte!(
            MAXIMUM_CONNECTION_FEE,
            connection_fee,
            CustomError::ConnectionFeeTooHigh
        );
        config.connection_fee = connection_fee;
    }

    if let Some(price) = price {
        require_gte!(price, 0, CustomError::InvalidPrice);
        config.price = price;
    }

    emit!(UpdateConfigEvent {
        version: config.version,
        config: config.key(),
        admin: *ctx.accounts.owner.key,
        fee_wallet: config.fee_wallet,
        connection_fee: config.connection_fee,
    });
    Ok(())
}
