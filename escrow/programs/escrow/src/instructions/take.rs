use anchor_lang::prelude::*;


use anchor_lang::prelude::*;  
use anchor_spl::token_interface::{TokenInterface, Mint, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{TransferChecked, transfer_checked, close_account, CloseAccount};


use crate::state::Escrow;
// First we work witht the accounts

#[derive(Accounts)]
pub struct Take<'info>{
    #[account(mut)]
    pub taker: Signer<'info>,
    #[account(mut)]
    pub maker: SystemAccount<'info>,
   
    pub mint_a: InterfaceAccount<'info,Mint>,
    pub mint_b: InterfaceAccount<'info,Mint>,

#[account(
    init_if_needed,
    payer= taker,
    associated_token::mint = mint_a,
    associated_token::authority = taker,
    associated_token::token_program = token_program
)]
    pub taker_ata_a: InterfaceAccount<'info,TokenAccount>,
   
   #[account(
    mut,
    associated_token::mint = mint_b,
    associated_token::authority = taker,
    associated_token::token_program = token_program
   )]
   pub taker_ata_b: InterfaceAccount<'info,TokenAccount>,

   #[account(
    init_if_needed,
    payer = taker,
    associated_token::mint = mint_b,
    associated_token::authority = maker,
    associated_token::token_program = token_program
   )]
   pub maker_ata_b: InterfaceAccount<'info,TokenAccount>,

   
   #[account(
        seeds = [
            b"escrow",
            maker.key().as_ref(),
            escrow.bump.to_le_bytes().as_ref(),
            ],
        has_one = mint_a.key(),
        has_one = mint_b.key(),
        bump = escrow.bump,
    )]
    pub escrow: Account<'info,Escrow>,

    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = escrow,
        associated_token::token_program = token_program
    )]
    pub vault: InterfaceAccount<'info,TokenAccount>,
    pub associated_token_program: Program<'info,AssociatedToken>,
    pub token_program: Interface<'info,TokenInterface>,
    pub system_program: Program<'info,System>,
   
}

impl <'info> Take<'info>{

    pub fn deposit(&mut self, deposit:u64) -> Result<()>{

        let cpi_program = self.token_program.to_account_info();
        let transfer_accounts = TransferChecked{
            from : self.taker_ata_b.to_account_info(),
            to: self.maker_ata_b.to_account_info(),
            mint: self.mint_b.to_account_info(),
            authority: self.taker.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(cpi_program, transfer_accounts);
        transfer_checked(cpi_ctx, deposit, self.mint_b.decimals)?;
        Ok(())
    }
    // Basically Transfer the funds from the vault to the maker
    pub fn release_fund(&mut self) -> Result<()>{
        let cpi_program = self.token_program.to_account_info();
        let transfer_accounts = TransferChecked{
            from: self.vault.to_account_info(),
            to: self.taker_ata_a.to_account_info(),
            mint: self.mint_a.to_account_info(),
            authority: self.escrow.to_account_info(),
        };

        let seeds = [
            b"escrow",
            self.escrow.maker.as_ref(),
            &self.escrow.bump.to_le_bytes()[..],
            &[self.escrow.bump],
        ];

        let signer_seeds = [&seeds[..]];
        

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, transfer_accounts, &signer_seeds);
        transfer_checked(cpi_ctx, self.escrow.receive, self.mint_a.decimals)?;

        Ok(())

    }


}