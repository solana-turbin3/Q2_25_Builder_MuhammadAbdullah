
#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;
use anchor_lang::system_program::{Transfer,transfer};

// A basic Vault program
declare_id!("HoU62Zx8NJHhcaLXy4WMxJbGbs7ssph5HFLeXun3x1CJ");

#[program]
pub mod vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.initialize(&ctx.bumps);
        Ok(())
    }

    pub fn deposit(ctx: Context<Payment>, amount: u64) -> Result<()>{
        ctx.accounts.deposit(amount)
    }

    pub fn withdraw(ctx: Context<Payment>, amount: u64) -> Result<()>{
        ctx.accounts.withdraw(amount)
    }

    pub fn close(ctx: Context<CloseVaultState>) -> Result<()>{
        ctx.accounts.close()
    }
}





#[derive(Accounts)]
pub struct Initialize <'info>{
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account (
    init,
    payer = user,
    seeds = [b"state",user.key().as_ref()],
    space = 8 + std::mem::size_of::<VaultState>(),
    bump,)]
    pub vault_state: Account<'info,VaultState>,

    #[account(
        seeds = [b"vault",user.key().as_ref()],
        bump,)]
    pub vault: SystemAccount<'info>,
    // #[account(
    //     init,
    //     payer = user,
    //     seeds = [b"vault",user.key().as_ref(),],
    //     token::mint = mint_account.key(),
    // )]
    // pub spl_vault: Account<'info,TokenAccount>,
    // pub mint_account: Account<'info,Mint>,

    pub system_program: Program<'info,System>,

}

impl<'info> Initialize<'info> {

    pub fn initialize(&mut self, bumps: &InitializeBumps) -> Result<()>{
        self.vault_state.vault_bump = bumps.vault;
        self.vault_state.state_bump = bumps.vault_state;

        Ok(())
    }

    
}

#[derive(Accounts)]
pub struct Payment<'info>{
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        seeds = [b"vault",user.key().as_ref()],
        bump = vault_state.state_bump,
    )]
    pub vault_state: Account<'info,VaultState>,

    #[account(
        seeds = [b"vault",user.key().as_ref()],
        bump = vault_state.vault_bump,
    )]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info,System>,
}

impl<'info> Payment<'info> {
    pub fn deposit(&mut self,amount:u64) -> Result<()> {
    let cpi_program = self.system_program.to_account_info();
    let cpi_account = Transfer {
        from:self.user.to_account_info(),
        to: self.vault.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(cpi_program,cpi_account);
    transfer(cpi_ctx,amount)?;
    Ok(())
    }

    pub fn withdraw(&mut self,amount:u64) -> Result<()> {
        let cpi_program = self.system_program.to_account_info();
        let cpi_account = Transfer {
            from:self.vault.to_account_info(),
            to: self.user.to_account_info(),
        };

        
        let seeds = &[
            b"vault",
            self.user.key.as_ref(),
            &[self.vault_state.vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];
        let cpi_ctx = CpiContext::new_with_signer(cpi_program,cpi_account,signer_seeds);
        transfer(cpi_ctx,amount)?;
        Ok(())
    }
}


#[derive(Accounts)]
pub struct CloseVaultState<'info>{
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"state",user.key().as_ref()],
        bump = vault_state.vault_bump,
        close = user,
    )]
    pub vault_state: Account<'info,VaultState>,

    #[account(
        seeds = [b"vault",user.key().as_ref()],
        bump = vault_state.vault_bump,
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info,System>,
    
}

impl<'info> CloseVaultState<'info> {

    pub fn close(&mut self) -> Result<()> {
        let cpi_program = self.system_program.to_account_info();
        let cpi_account = Transfer {
            from:self.vault.to_account_info(),
            to: self.user.to_account_info(),
        };

        
        let seeds = &[
            b"vault",
            self.user.key.as_ref(),
            &[self.vault_state.vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];
        let cpi_ctx = CpiContext::new_with_signer(cpi_program,cpi_account,signer_seeds);
        transfer(cpi_ctx,self.vault.lamports())?;
        Ok(())

       
    }
}


#[account]
pub struct VaultState {
    pub vault_bump: u8,
    pub state_bump: u8,
}

// impl Space for VaultState {
// const SPACE: usize = 8 + std::mem::size_of::<VaultState>();
// }