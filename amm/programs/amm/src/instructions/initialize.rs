use anchor_lang::prelude::*;

use crate::state::Config;

#[derive(Accounts)]
#[instruction(seeds: &[&[u8]])]
pub struct Initialize<'info>{
    #[account(mut)]
    pub admin: Signer<'info>,

    pub mint_x: Account<'info, Mint>,
    pub mint_y: Account<'info, Mint>,

#[account(
    init,
    payer=admin,
    seeds = [b"lp",config.key_as_ref()],
    bump,
    mint::decimals = 6,
    mint::authority = config
)]
    pub mint_lp: Account<'info, Mint>,
    #[account(
        init,
        payer = admin,
        associated_token::mint = mint_x,
        associated_token::authority = config,
    )]
    pub vault_x: Account<'info,TokenAccount>,
    
    #[account(
        init,
        payer = admin,
        associated_token::mint = mint_x,
        associated_token::authority = config,
    )]
    pub vault_y: Account<'info,TokenAccount>,

    #[account(
        init
        payer = admin,
        seeds = [b"config",seeds.to_le_bytes().as_ref()],
        bump,
        space = Config::INIT_SPACE,

    )]
    pub config: Account<'info, Config>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>
    
}


impl<'info> Initialize<'info>{
    pub fn initialize(&mut self,seed: u64,fee:u16,authority:Option<Pubkey>,bump:&InitializeBumps)->Result<()> {
        self.config.set_inner(Config{
            seed,
            fee,
            authority,
            mint_x: self.mint_x.key(),
            mint_y: self.mint_y.key(),
            locked: false,
            config_bump: self.config.bump,
            lp_bump: bumps.mint_lp,
        });
        Ok(())
    }
}
#[derive(Accounts)]
pub struct Initialize {}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    msg!("Greetings from: {:?}", ctx.program_id);
    Ok(())
}
