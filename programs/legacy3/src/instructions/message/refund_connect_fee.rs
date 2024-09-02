use crate::{
    constants::{CONFIG_SEED, CONNECTION_SEED, CONNECTION_VAULT_SEED, ROLE_SEED},
    errors::CustomError,
    event::RefundConnectFeeEvent,
    utils::transfer_native_to_account,
    Config, Connection, ConnectionStatus, Role, RoleAccount,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct RefundConnectionFee<'info> {
    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump,
    )]
    pub config: Box<Account<'info, Config>>,

    #[account(
        seeds = [ROLE_SEED, config.key().as_ref(), operator.key().as_ref()],
        bump = role_account.bump,
        constraint = role_account.role == Role::Operator @ CustomError::Unauthorized,
        constraint = role_account.user == operator.key() @ CustomError::Unauthorized,
        constraint = role_account.active @ CustomError::Unauthorized,
    )]
    pub role_account: Box<Account<'info, RoleAccount>>,

    #[account(
        mut,
        seeds = [CONNECTION_SEED, connection.sender.key().as_ref(), connection.receiver.key().as_ref()],
        bump = connection.bump,
        constraint = connection.status == ConnectionStatus::Opened @ CustomError::InvalidConnectionStatus,
        constraint = connection.sender == *sender.key @ CustomError::Unauthorized,
    )]
    pub connection: Box<Account<'info, Connection>>,

    /// CHECK: connection_vault
    #[account(
        mut,
        seeds = [CONNECTION_VAULT_SEED, connection.key().as_ref()],
        bump = connection.vault_bump,
    )]
    pub connection_vault: SystemAccount<'info>,

    /// CHECK: This is not dangerous because this account use to write into connection
    #[account(constraint = sender.data_is_empty())]
    pub sender: AccountInfo<'info>,

    /// Address to be set as operator.
    #[account(mut)]
    pub operator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler_refund_connection_fee(ctx: Context<RefundConnectionFee>) -> Result<()> {
    let connection = &mut *ctx.accounts.connection;

    let connection_key = connection.key();
    let connection_vault_seeds: &[&[&[u8]]] = &[&[
        CONNECTION_VAULT_SEED,
        connection_key.as_ref(),
        &connection.vault_bump.to_le_bytes(),
    ]];

    // refund the connection fee to the sender
    transfer_native_to_account(
        ctx.accounts.connection_vault.to_account_info(),
        ctx.accounts.sender.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        connection.sol_amount,
        Some(connection_vault_seeds),
    )?;

    connection.status = ConnectionStatus::Refunded;

    emit!(RefundConnectFeeEvent {
        version: connection.version,
        connection: connection.key(),
        operator: *ctx.accounts.operator.key,
        sender: connection.sender,
        sol_amount: connection.sol_amount,
        connection_status: connection.status,
    });
    Ok(())
}
