use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("DontClickThat111111111111111111111111111111");

#[program]
pub mod dont_click_that {
    use super::*;

    pub fn initialize_game(
        ctx: Context<InitializeGame>,
        game_id: u64,
        stake_amount: u64,
        seed: u64,
    ) -> Result<()> {
        let game = &mut ctx.accounts.game;
        game.game_id = game_id;
        game.player1 = ctx.accounts.player1.key();
        game.player2 = Pubkey::default(); // Will be set when second player joins
        game.stake_amount = stake_amount;
        game.seed = seed;
        game.status = GameStatus::WaitingForPlayer;
        game.total_pot = 0;
        game.winner = Pubkey::default();
        game.bump = *ctx.bumps.get("game").unwrap();
        
        Ok(())
    }

    pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        
        require!(
            game.status == GameStatus::WaitingForPlayer,
            GameError::GameNotWaiting
        );
        
        require!(
            game.player2 == Pubkey::default(),
            GameError::GameFull
        );
        
        // Transfer stake from player2 to game vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.player2_token_account.to_account_info(),
                    to: ctx.accounts.game_vault.to_account_info(),
                    authority: ctx.accounts.player2.to_account_info(),
                },
            ),
            game.stake_amount,
        )?;

        game.player2 = ctx.accounts.player2.key();
        game.total_pot = game.stake_amount * 2;
        game.status = GameStatus::InProgress;
        
        Ok(())
    }

    pub fn stake_tokens(ctx: Context<StakeTokens>) -> Result<()> {
        let game = &ctx.accounts.game;
        
        require!(
            game.status == GameStatus::WaitingForPlayer || game.status == GameStatus::InProgress,
            GameError::InvalidGameStatus
        );
        
        // Transfer stake from player1 to game vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.player_token_account.to_account_info(),
                    to: ctx.accounts.game_vault.to_account_info(),
                    authority: ctx.accounts.player.to_account_info(),
                },
            ),
            game.stake_amount,
        )?;
        
        Ok(())
    }

    pub fn finalize_game(
        ctx: Context<FinalizeGame>,
        winner: Pubkey,
    ) -> Result<()> {
        let game = &mut ctx.accounts.game;
        
        require!(
            game.status == GameStatus::InProgress,
            GameError::GameNotInProgress
        );
        
        require!(
            winner == game.player1 || winner == game.player2,
            GameError::InvalidWinner
        );
        
        game.winner = winner;
        game.status = GameStatus::Finished;
        
        // Transfer entire pot to winner
        let seeds = &[
            b"game",
            &game.game_id.to_le_bytes(),
            &[game.bump],
        ];
        let signer = &[&seeds[..]];
        
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.game_vault.to_account_info(),
                    to: ctx.accounts.winner_token_account.to_account_info(),
                    authority: ctx.accounts.game.to_account_info(),
                },
                signer,
            ),
            game.total_pot,
        )?;
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct InitializeGame<'info> {
    #[account(
        init,
        payer = player1,
        space = Game::LEN,
        seeds = [b"game", game_id.to_le_bytes().as_ref()],
        bump
    )]
    pub game: Account<'info, Game>,
    
    #[account(mut)]
    pub player1: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct JoinGame<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    
    #[account(mut)]
    pub player2: Signer<'info>,
    
    #[account(mut)]
    pub player2_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub game_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct StakeTokens<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    #[account(mut)]
    pub player_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub game_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct FinalizeGame<'info> {
    #[account(
        mut,
        seeds = [b"game", game.game_id.to_le_bytes().as_ref()],
        bump = game.bump
    )]
    pub game: Account<'info, Game>,
    
    #[account(mut)]
    pub game_vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub winner_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Game {
    pub game_id: u64,
    pub player1: Pubkey,
    pub player2: Pubkey,
    pub stake_amount: u64,
    pub total_pot: u64,
    pub seed: u64,
    pub status: GameStatus,
    pub winner: Pubkey,
    pub bump: u8,
}

impl Game {
    pub const LEN: usize = 8 + // discriminator
        8 + // game_id
        32 + // player1
        32 + // player2
        8 + // stake_amount
        8 + // total_pot
        8 + // seed
        1 + // status
        32 + // winner
        1; // bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum GameStatus {
    WaitingForPlayer,
    InProgress,
    Finished,
}

#[error_code]
pub enum GameError {
    #[msg("Game is not waiting for a player")]
    GameNotWaiting,
    #[msg("Game is already full")]
    GameFull,
    #[msg("Game is not in progress")]
    GameNotInProgress,
    #[msg("Invalid game status")]
    InvalidGameStatus,
    #[msg("Invalid winner")]
    InvalidWinner,
}