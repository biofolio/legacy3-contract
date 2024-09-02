use crate::{
    constants::{CONFIG_SEED, CONNECTION_SEED, CONNECTION_VAULT_SEED},
    errors::CustomError,
    event::ClaimConnectFeeEvent,
    utils::transfer_native_to_account,
    Config, Connection, ConnectionStatus,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ClaimConnectionFee<'info> {
    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump,
    )]
    pub config: Box<Account<'info, Config>>,

    #[account(
        mut,
        seeds = [CONNECTION_SEED, connection.sender.key().as_ref(), connection.receiver.key().as_ref()],
        bump = connection.bump,
        constraint = connection.receiver == *receiver.key @ CustomError::Unauthorized,
        constraint = connection.status == ConnectionStatus::Opened @ CustomError::InvalidConnectionStatus,
    )]
    pub connection: Box<Account<'info, Connection>>,

    /// CHECK: connection_vault
    #[account(
        mut,
        seeds = [CONNECTION_VAULT_SEED, connection.key().as_ref()],
        bump = connection.vault_bump,
    )]
    pub connection_vault: SystemAccount<'info>,

    #[account(mut)]
    pub receiver: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler_claim_connection_fee(ctx: Context<ClaimConnectionFee>) -> Result<()> {
    let connection = &mut *ctx.accounts.connection;

    let connection_key = connection.key();
    let connection_vault_seeds: &[&[&[u8]]] = &[&[
        CONNECTION_VAULT_SEED,
        connection_key.as_ref(),
        &connection.vault_bump.to_le_bytes(),
    ]];

    // Transfer the connection fee to the receiver
    transfer_native_to_account(
        ctx.accounts.connection_vault.to_account_info(),
        ctx.accounts.receiver.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        connection.sol_amount,
        Some(connection_vault_seeds),
    )?;

    connection.status = ConnectionStatus::Connected;

    emit!(ClaimConnectFeeEvent {
        version: connection.version,
        connection: connection.key(),
        sender: connection.sender,
        receiver: *ctx.accounts.receiver.key,
        sol_amount: connection.sol_amount,
        connection_status: connection.status,
    });
    Ok(())
}
