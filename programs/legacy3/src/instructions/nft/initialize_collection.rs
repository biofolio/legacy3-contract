use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3,
        mpl_token_metadata::types::{Creator, DataV2},
        CreateMasterEditionV3, CreateMetadataAccountsV3, Metadata,
    },
    token::{mint_to, InitializeAccount, Mint, MintTo, Token, TokenAccount},
};

use crate::{
    constants::{CONFIG_SEED, CONFIG_TOKEN_SEED},
    errors::CustomError,
    event::InitializeCollectionEvent,
    utils::{find_master_edition_account, find_metadata_account},
    Config,
};

#[derive(Accounts)]
#[instruction()]
pub struct InitializeCollection<'info> {
    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config_account.bump,
        constraint = config_account.collection == Pubkey::default() @ CustomError::CollectionAlreadyInitialized,
    )]
    pub config_account: Box<Account<'info, Config>>,

    #[account(
        init,
        payer = owner,
        mint::decimals = 0,
        mint::authority = config_account,
        mint::freeze_authority = config_account
    )]
    pub collection: Box<Account<'info, Mint>>,

    /// CHECK - address
    #[account(
        mut,
        seeds = [CONFIG_TOKEN_SEED, config_account.key().as_ref(), collection.key().as_ref()],
        bump,
    )]
    pub config_token_account: AccountInfo<'info>,

    /// CHECK - address
    #[account(
        mut,
        address=find_metadata_account(&collection.key()).0,
    )]
    pub metadata_account: AccountInfo<'info>,

    /// CHECK: address
    #[account(
        mut,
        address=find_master_edition_account(&collection.key()).0,
    )]
    pub master_edition_account: AccountInfo<'info>,

    #[account(
        mut,
        address = crate::admin::id() @ CustomError::Unauthorized,
    )]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler_initialize_collection<'info>(
    ctx: Context<'_, '_, '_, 'info, InitializeCollection<'info>>,
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {
    let config_account = &mut *ctx.accounts.config_account;
    let config_account_bump = &config_account.bump.to_le_bytes();
    // create collection account
    let seeds: &[&[&[u8]]] = &[&[CONFIG_SEED, config_account_bump]];

    let config_key = config_account.key();
    let collection_key = ctx.accounts.collection.key();
    let config_token_account_bump = &ctx.bumps.config_token_account.to_le_bytes();
    let config_token_account_seeds: &[&[&[u8]]] = &[&[
        CONFIG_TOKEN_SEED,
        config_key.as_ref(),
        collection_key.as_ref(),
        config_token_account_bump,
    ]];

    let lamports = ctx.accounts.rent.minimum_balance(TokenAccount::LEN);
    anchor_lang::solana_program::program::invoke_signed(
        &anchor_lang::solana_program::system_instruction::create_account(
            ctx.accounts.owner.key,
            ctx.accounts.config_token_account.key,
            lamports,
            TokenAccount::LEN as u64,
            &ctx.accounts.token_program.key(),
        ),
        &[
            ctx.accounts.owner.to_account_info(),
            ctx.accounts.config_token_account.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
        ],
        config_token_account_seeds,
    )?;

    // init config collection account
    let cpi_accounts = InitializeAccount {
        account: ctx.accounts.config_token_account.to_account_info(),
        mint: ctx.accounts.collection.to_account_info(),
        authority: config_account.to_account_info(),
        rent: ctx.accounts.rent.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds);
    anchor_spl::token::initialize_account(cpi_ctx)?;

    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.collection.to_account_info(),
                to: ctx.accounts.config_token_account.to_account_info(),
                authority: config_account.to_account_info(),
            },
            seeds,
        ),
        1,
    )?;

    let creator = Creator {
        address: config_account.key(),
        verified: true,
        share: 100,
    };
    let data_v2 = DataV2 {
        name: name.clone(),
        symbol: symbol.clone(),
        uri: uri.clone(),
        seller_fee_basis_points: 0,
        creators: Some([creator].to_vec()),
        collection: None,
        uses: None,
    };

    // // CPI Context
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_metadata_program.to_account_info(),
        CreateMetadataAccountsV3 {
            metadata: ctx.accounts.metadata_account.to_account_info(), // the metadata account being created
            mint: ctx.accounts.collection.to_account_info(), // the mint account of the metadata account
            mint_authority: config_account.to_account_info(), // the mint authority of the mint account
            update_authority: config_account.to_account_info(), // the update authority of the metadata account
            payer: ctx.accounts.owner.to_account_info(), // the payer for creating the metadata account
            system_program: ctx.accounts.system_program.to_account_info(), // the system program account
            rent: ctx.accounts.rent.to_account_info(), // the rent sysvar account
        },
        seeds,
    );
    create_metadata_accounts_v3(
        cpi_ctx, // cpi context
        data_v2, // token metadata
        true,    // is_mutable
        true, None, // collection details
    )?;

    // create master edition
    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.token_metadata_program.to_account_info(),
        CreateMasterEditionV3 {
            edition: ctx.accounts.master_edition_account.to_account_info(),
            mint: ctx.accounts.collection.to_account_info(),
            update_authority: config_account.to_account_info(),
            mint_authority: config_account.to_account_info(),
            payer: ctx.accounts.owner.to_account_info(),
            metadata: ctx.accounts.metadata_account.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        },
        seeds,
    );

    create_master_edition_v3(cpi_context, Some(0))?;

    config_account.collection = ctx.accounts.collection.key();

    emit!(InitializeCollectionEvent {
        collection: ctx.accounts.collection.key(),
        config_account: ctx.accounts.config_account.key(),
        owner: ctx.accounts.owner.key(),
        collection_name: name,
        collection_symbol: symbol,
        collection_uri: uri,
    });
    Ok(())
}
