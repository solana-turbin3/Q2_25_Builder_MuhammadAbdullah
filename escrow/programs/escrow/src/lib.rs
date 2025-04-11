use anchor_lang::prelude::*;
pub mod instructions;
pub mod state;

pub use instructions::*;
pub use state::*;

declare_id!("7xJDkMLg5yFgRVeJUN8j37gdFENNR9euGj1zarjzQpwN");
// Flow of the program
//* Two Actors in the program: 
// 1. Maker 
// 2. Taker

//* Maker will make the escrow account and deposit the funds
//* Taker will take the funds from the escrow account
//* Taker will release the funds to the maker

//* The program will be used to exchange two different tokens

#[program]
pub mod escrow {
    use super::*;

    pub fn make(ctx: Context<Make>,seed:u64,deposit:u64,receive:u64) -> Result<()> {
        ctx.accounts.init_escrow(seed,receive, &ctx.bumps)?;
        ctx.accounts.deposit(deposit)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
