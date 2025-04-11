pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("3zW48HUnnALo2eSKGZ9BcXe7MqJbF7mEnZfFwQxQVCF4");

#[program]
pub mod amm {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }
}
