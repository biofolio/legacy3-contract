use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::metadata::mpl_token_metadata;

use crate::constants::EDITION;
use crate::constants::PREFIX;

pub fn find_metadata_account(mint: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[PREFIX.as_bytes(), mpl_token_metadata::ID.as_ref(), mint.as_ref()],
        &mpl_token_metadata::ID
    )
}

pub fn find_master_edition_account(mint: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[PREFIX.as_bytes(), mpl_token_metadata::ID.as_ref(), mint.as_ref(), EDITION.as_bytes()],
        &mpl_token_metadata::ID
    )
}


#[inline(never)]
pub fn transfer_native_to_account<'info>(
    from: AccountInfo<'info>,
    to: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
    amount: u64,
    seeds: Option<&[&[&[u8]]]>,
) -> Result<()> {
    match seeds {
        Some(seeds) => {
            system_program::transfer(
                CpiContext::new_with_signer(
                    system_program.to_account_info(),
                    system_program::Transfer {
                        from: from.to_account_info(),
                        to: to.to_account_info(),
                    },
                    seeds,
                ),
                amount,
            )?;
        }
        None => {
            system_program::transfer(
                CpiContext::new(
                    system_program.to_account_info(),
                    system_program::Transfer {
                        from: from.to_account_info(),
                        to: to.to_account_info(),
                    },
                ),
                amount,
            )?;
        }
    }

    Ok(())
}
