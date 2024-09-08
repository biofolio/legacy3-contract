use crate::{
    constants::{CONFIG_SEED, CONNECTION_SEED, CONNECTION_VAULT_SEED, ROLE_SEED},
    errors::CustomError,
    event::PayConnectFeeEvent,
    utils::transfer_native_to_account,
    Config, Connection, ConnectionStatus, Role, RoleAccount,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(sol_amount: u64)]
pub struct PayConnectionFee<'info> {
    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump,
    )]
    pub config: Box<Account<'info, Config>>,

    #[account(
        seeds = [ROLE_SEED, config.key().as_ref(), operator.key().as_ref()],
        bump = role_account.bump,
        constraint = role_account.user == operator.key() @ CustomError::Unauthorized,
    )]
    pub role_account: Box<Account<'info, RoleAccount>>,

    #[account(
        init_if_needed,
        payer = sender,
        seeds = [CONNECTION_SEED, sender.key().as_ref(), receiver.key().as_ref()],
        bump,
        space = 8 + RoleAccount::INIT_SPACE,
        constraint = connection.status == ConnectionStatus::Opened || connection.status == ConnectionStatus::Refunded @ CustomError::InvalidConnectionStatus,
        constraint = sol_amount > 0 @ CustomError::InvalidSolAmount,
    )]
    pub connection: Box<Account<'info, Connection>>,

    /// CHECK: connection_vault
    #[account(
        init_if_needed,
        payer = sender,
        seeds = [CONNECTION_VAULT_SEED, connection.key().as_ref()],
        bump,
        space = 0,
        owner = system_program.key()
    )]
    pub connection_vault: AccountInfo<'info>,

    /// CHECK: This is not dangerous because this account use to write into connection
    #[account(constraint = receiver.data_is_empty())]
    pub receiver: AccountInfo<'info>,

    #[account(mut, constraint = role_account.role == Role::Operator @ CustomError::Unauthorized)]
    pub operator: Signer<'info>,

    #[account(mut)]
    pub sender: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler_pay_connection_fee(ctx: Context<PayConnectionFee>, sol_amount: u64) -> Result<()> {
    let connection = &mut *ctx.accounts.connection;

    // Transfer the connection fee to the vault
    transfer_native_to_account(
        ctx.accounts.sender.to_account_info(),
        ctx.accounts.connection_vault.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        sol_amount,
        None,
    )?;

    connection.version = 1;
    connection.bump = ctx.bumps.connection;
    connection.vault_bump = ctx.bumps.connection_vault;
    connection.sender = *ctx.accounts.sender.key;
    connection.receiver = *ctx.accounts.receiver.key;
    connection.sol_amount = sol_amount;
    connection.status = ConnectionStatus::Opened;

    emit!(PayConnectFeeEvent {
        version: connection.version,
        connection: connection.key(),
        connection_vault: *ctx.accounts.connection_vault.key,
        sender: *ctx.accounts.sender.key,
        receiver: *ctx.accounts.receiver.key,
        sol_amount,
        connection_status: connection.status,
    });
    Ok(())
}
