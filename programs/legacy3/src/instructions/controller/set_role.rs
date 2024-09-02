use crate::{
    constants::{CONFIG_SEED, ROLE_SEED},
    errors::CustomError,
    event::SetRoleEvent,
    Config, Role, RoleAccount,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SetRole<'info> {
    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump,
    )]
    pub config: Box<Account<'info, Config>>,

    #[account(
        init_if_needed,
        payer = owner,
        seeds = [ROLE_SEED, config.key().as_ref(), user.key().as_ref()],
        bump,
        space = 8 + RoleAccount::INIT_SPACE
    )]
    pub role_account: Account<'info, RoleAccount>,

    /// CHECK: This is not dangerous because this account use to write into role_account
    #[account(constraint = user.data_is_empty())]
    pub user: AccountInfo<'info>,

    /// Address to be set as protocol owner.
    #[account(
        mut,
        address = crate::admin::id() @ CustomError::Unauthorized
    )]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler_set_role(ctx: Context<SetRole>, role: Role, active: bool) -> Result<()> {
    let role_account = &mut ctx.accounts.role_account;

    role_account.user = ctx.accounts.user.key();
    role_account.role = role;
    role_account.active = active;
    role_account.bump = ctx.bumps.role_account;

    let role_account_clone = ctx.accounts.role_account.clone();

    emit!(SetRoleEvent {
        user: role_account_clone.user,
        role: role_account_clone.role,
        active,
        config: ctx.accounts.config.key(),
    });
    Ok(())
}
