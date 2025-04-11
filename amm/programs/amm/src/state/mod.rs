use anchor_lang::prelude::*;



#[derive(InitSpace)]
#[account]
pub struct Config{
    pub seed: u64,
    pub authority: Option<Pubkey>,
    pub mint_x: Pubkey,
    pub mint_y: Pubkey,
    pub fee: u16,
    pub locked:bool,
    pub config_bump: u8,
    pub lp_bump: u8,
}

impl Config{
    pub const LEN: usize = 8 + 32 + 32 + 2 + 1 + 1 + 1;
}
