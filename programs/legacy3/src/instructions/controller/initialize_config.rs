use crate::{
    constants::{CONFIG_SEED, MAXIMUM_CONNECTION_FEE},
    errors::CustomError,
    event::InitializeConfigEvent,
    state::Config,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(connection_fee: u64, price: u64)]
pub struct InitializeConfig<'info> {
    /// Address to be set as protocol owner.
    #[account(
        mut,
        address = crate::admin::id() @ CustomError::Unauthorized
    )]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        seeds = [CONFIG_SEED],
        bump,
        space = 8 + Config::INIT_SPACE
    )]
    pub config: Box<Account<'info, Config>>,

    /// CHECK: fee wallet account
    #[account(
        constraint = fee_wallet.data_is_empty() && !fee_wallet.executable && fee_wallet.key() != Pubkey::default() @ CustomError::InvalidFeeWallet,
        constraint = connection_fee < MAXIMUM_CONNECTION_FEE @ CustomError::ConnectionFeeTooHigh,
        constraint = price > 0 @ CustomError::InvalidPrice
    )]
    pub fee_wallet: AccountInfo<'info>,

    /// CHECK: this account use to setup treasury
    #[account(constraint = treasury.data_is_empty() && !fee_wallet.executable && fee_wallet.key() != Pubkey::default() @ CustomError::InvalidTreasury)]
    pub treasury: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler_initialize_config(
    ctx: Context<InitializeConfig>,
    connection_fee: u64,
    price: u64,
) -> Result<()> {
    let config = &mut *ctx.accounts.config;

    config.version = 1;
    config.bump = ctx.bumps.config;
    config.connection_fee = connection_fee;
    config.price = price;
    config.fee_wallet = *ctx.accounts.fee_wallet.key;
    config.treasury = *ctx.accounts.treasury.key;

    emit!(InitializeConfigEvent {
        version: config.version,
        config: config.key(),
        admin: *ctx.accounts.owner.key,
        treasury: config.treasury,
        fee_wallet: config.fee_wallet,
        connection_fee: config.connection_fee,
    });
    Ok(())
}
