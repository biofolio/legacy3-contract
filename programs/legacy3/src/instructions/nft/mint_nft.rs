use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3,
        mpl_token_metadata::{
            instructions::VerifyCollectionV1CpiBuilder,
            types::{Collection, Creator, DataV2},
        },
        CreateMasterEditionV3, CreateMetadataAccountsV3, Metadata,
    },
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};

use crate::{
    constants::{CONFIG_SEED, NFT_MINT_SEED},
    errors::CustomError,
    event::MintNftEvent,
    utils::{find_master_edition_account, find_metadata_account, transfer_native_to_account},
    Config,
};

#[derive(Accounts)]
#[instruction(name: String)]
pub struct MintNft<'info> {
    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config_account.bump,
        has_one = treasury @ CustomError::InvalidTreasury,
        has_one = collection
    )]
    pub config_account: Box<Account<'info, Config>>,

    #[account(
        init,
        payer = user,
        seeds = [NFT_MINT_SEED, name.as_bytes()],
        bump,
        mint::decimals = 0,
        mint::authority = config_account.key(),
        mint::freeze_authority = config_account.key()
    )]
    pub mint: Box<Account<'info, Mint>>,
    /// CHECK - address
    #[account(
        mut,
        address=find_metadata_account(&mint.key()).0,
    )]
    pub metadata_account: AccountInfo<'info>,

    /// CHECK: address
    #[account(
        mut,
        address=find_master_edition_account(&mint.key()).0,
    )]
    pub master_edition_account: AccountInfo<'info>,

    /// CHECK - address
    #[account(mut)]
    pub collection: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = user,
        associated_token::mint = mint,
        associated_token::authority = user
    )]
    pub user_token_account: Box<Account<'info, TokenAccount>>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub treasury: AccountInfo<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    // #[account(
    //     seeds = [ROLE_SEED, config_account.key().as_ref(), operator.key().as_ref()],
    //     bump = role_account.bump,
    //     constraint = role_account.user == operator.key() @ CustomError::Unauthorized,
    // )]
    // pub role_account: Box<Account<'info, RoleAccount>>,

    // #[account(mut, constraint = role_account.role == Role::Minter @ CustomError::Unauthorized)]
    // pub operator: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler_mint_nft<'info>(
    ctx: Context<'_, '_, '_, 'info, MintNft<'info>>,
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {
    let config_account = &mut *ctx.accounts.config_account;
    // charge mint fee
    if config_account.price > 0 {
        transfer_native_to_account(
            ctx.accounts.user.to_account_info(),
            ctx.accounts.treasury.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            config_account.price,
            None,
        )?;
    }

    // // check user have been minted
    // let user_config_account = &mut ctx.remaining_accounts.get(0).unwrap();
    // require!(user_config_account.data_is_empty(), CustomError::UserMinted);

    // let user = &mut ctx.accounts.user;
    // let collection_key = ctx.accounts.collection.key();
    // let user_config_bump = Pubkey::find_program_address(
    //     &[
    //         USER_CONFIG_PDA_SEED,
    //         user.key().as_ref(),
    //         collection_key.as_ref(),
    //     ],
    //     &program::MintNft::id(),
    // )
    // .1;

    // let user_key = user.key();
    // let signers_seeds = &[&[
    //     USER_CONFIG_PDA_SEED,
    //     user_key.as_ref(),
    //     collection_key.as_ref(),
    //     bytemuck::bytes_of(&user_config_bump),
    // ][..]];
    // let lamports = ctx.accounts.rent.minimum_balance(8);
    // anchor_lang::solana_program::program::invoke_signed(
    //     &anchor_lang::solana_program::system_instruction::create_account(
    //         user.key,
    //         user_config_account.key,
    //         lamports,
    //         8,
    //         &ctx.accounts.system_program.key(),
    //     ),
    //     &[
    //         user.to_account_info(),
    //         user_config_account.to_account_info(),
    //         ctx.accounts.system_program.to_account_info(),
    //     ],
    //     signers_seeds,
    // )?;

    let config_account_bump = &config_account.bump.to_le_bytes();
    let seeds = &[&[CONFIG_SEED, config_account_bump][..]];

    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: config_account.to_account_info(),
            },
            seeds,
        ),
        1,
    )?;

    // On-chain token metadata for the mint
    let creator = Creator {
        address: config_account.key(),
        verified: true,
        share: 0,
    };
    let user_creator = Creator {
        address: ctx.accounts.user.key(),
        verified: false,
        share: 100,
    };
    let data_v2 = DataV2 {
        name: name.clone(),
        symbol: symbol.clone(),
        uri: uri.clone(),
        seller_fee_basis_points: 0,
        creators: Some([creator, user_creator].to_vec()),
        collection: Some(Collection {
            verified: false,
            key: ctx.accounts.collection.key(),
        }),
        uses: None,
    };

    // CPI Context
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_metadata_program.to_account_info(),
        CreateMetadataAccountsV3 {
            metadata: ctx.accounts.metadata_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            mint_authority: config_account.to_account_info(),
            update_authority: config_account.to_account_info(),
            payer: ctx.accounts.user.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        },
        seeds,
    );
    create_metadata_accounts_v3(cpi_ctx, data_v2, true, true, None)?;

    // create master edition
    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.token_metadata_program.to_account_info(),
        CreateMasterEditionV3 {
            edition: ctx.accounts.master_edition_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            update_authority: config_account.to_account_info(),
            mint_authority: config_account.to_account_info(),
            payer: ctx.accounts.user.to_account_info(),
            metadata: ctx.accounts.metadata_account.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        },
        seeds,
    );

    create_master_edition_v3(cpi_context, Some(1))?;

    // Verify collection
    let collection_metadata = ctx.remaining_accounts.get(0).unwrap();
    let collection_master_edition = ctx.remaining_accounts.get(1).unwrap();
    VerifyCollectionV1CpiBuilder::new(&ctx.accounts.token_metadata_program.to_account_info())
        .authority(&config_account.to_account_info())
        .collection_mint(&ctx.accounts.collection.to_account_info())
        .collection_metadata(Some(&collection_metadata.to_account_info()))
        .collection_master_edition(Some(&collection_master_edition.to_account_info()))
        .metadata(&ctx.accounts.metadata_account.to_account_info())
        .system_program(&ctx.accounts.system_program.to_account_info())
        .sysvar_instructions(&ctx.accounts.rent.to_account_info())
        .invoke_signed(seeds)?;
    // emit event
    emit!(MintNftEvent {
        mint_address: ctx.accounts.mint.key(),
        user: ctx.accounts.user.key(),
        // operator: ctx.accounts.operator.key(),
        config_account: config_account.key(),
        nft_name: name,
        nft_symbol: symbol,
        nft_uri: uri,
        price: config_account.price,
    });

    Ok(())
}
