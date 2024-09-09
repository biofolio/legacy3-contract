use crate::{
    constants::CONFIG_SEED, errors::CustomError, event::DonateEvent,
    utils::transfer_native_to_account, Config,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(sol_amount: u64)]
pub struct Donate<'info> {
    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump,
        constraint = sol_amount > 0 @ CustomError::InvalidSolAmount,
    )]
    pub config: Box<Account<'info, Config>>,

    /// CHECK: This is not dangerous because this account use to write into connection
    #[account(constraint = receiver.data_is_empty())]
    pub receiver: AccountInfo<'info>,

    #[account(mut)]
    pub sender: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler_donate(ctx: Context<Donate>, sol_amount: u64) -> Result<()> {
    // Transfer the connection fee to the vault
    transfer_native_to_account(
        ctx.accounts.sender.to_account_info(),
        ctx.accounts.receiver.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        sol_amount,
        None,
    )?;

    emit!(DonateEvent {
        version: ctx.accounts.config.version,
        sender: *ctx.accounts.sender.key,
        receiver: *ctx.accounts.receiver.key,
        sol_amount,
    });
    Ok(())
}
