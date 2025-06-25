import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { AnchorProvider, Program, web3 } from '@coral-xyz/anchor'

// IDL for the smart contract (simplified - would normally be generated)
const IDL = {
  "version": "0.1.0",
  "name": "dont_click_that",
  "instructions": [
    {
      "name": "initializeGame",
      "accounts": [
        { "name": "game", "isMut": true, "isSigner": false },
        { "name": "player1", "isMut": true, "isSigner": true },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "gameId", "type": "u64" },
        { "name": "stakeAmount", "type": "u64" },
        { "name": "seed", "type": "u64" }
      ]
    },
    {
      "name": "joinGame",
      "accounts": [
        { "name": "game", "isMut": true, "isSigner": false },
        { "name": "player2", "isMut": true, "isSigner": true },
        { "name": "player2TokenAccount", "isMut": true, "isSigner": false },
        { "name": "gameVault", "isMut": true, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    },
    {
      "name": "finalizeGame",
      "accounts": [
        { "name": "game", "isMut": true, "isSigner": false },
        { "name": "gameVault", "isMut": true, "isSigner": false },
        { "name": "winnerTokenAccount", "isMut": true, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "winner", "type": "publicKey" }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Game",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "gameId", "type": "u64" },
          { "name": "player1", "type": "publicKey" },
          { "name": "player2", "type": "publicKey" },
          { "name": "stakeAmount", "type": "u64" },
          { "name": "totalPot", "type": "u64" },
          { "name": "seed", "type": "u64" },
          { "name": "status", "type": { "defined": "GameStatus" } },
          { "name": "winner", "type": "publicKey" },
          { "name": "bump", "type": "u8" }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "GameStatus",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "WaitingForPlayer" },
          { "name": "InProgress" },
          { "name": "Finished" }
        ]
      }
    }
  ]
}

const PROGRAM_ID = new PublicKey('DontClickThat111111111111111111111111111111')

export class SolanaGameClient {
  constructor(wallet, connection) {
    this.wallet = wallet
    this.connection = connection || new Connection(clusterApiUrl('devnet'))
    this.provider = new AnchorProvider(this.connection, wallet, {})
    this.program = new Program(IDL, PROGRAM_ID, this.provider)
  }

  async initializeGame(gameId, stakeAmount, seed) {
    try {
      const [gamePDA] = await PublicKey.findProgramAddress(
        [Buffer.from('game'), new web3.BN(gameId).toArrayLike(Buffer, 'le', 8)],
        this.program.programId
      )

      const tx = await this.program.methods
        .initializeGame(new web3.BN(gameId), new web3.BN(stakeAmount), new web3.BN(seed))
        .accounts({
          game: gamePDA,
          player1: this.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc()

      return { txHash: tx, gamePDA }
    } catch (error) {
      console.error('Error initializing game:', error)
      throw error
    }
  }

  async joinGame(gamePDA, player2TokenAccount, gameVault) {
    try {
      const tx = await this.program.methods
        .joinGame()
        .accounts({
          game: gamePDA,
          player2: this.wallet.publicKey,
          player2TokenAccount,
          gameVault,
          tokenProgram: web3.TOKEN_PROGRAM_ID,
        })
        .rpc()

      return tx
    } catch (error) {
      console.error('Error joining game:', error)
      throw error
    }
  }

  async finalizeGame(gamePDA, winner, gameVault, winnerTokenAccount) {
    try {
      const tx = await this.program.methods
        .finalizeGame(winner)
        .accounts({
          game: gamePDA,
          gameVault,
          winnerTokenAccount,
          tokenProgram: web3.TOKEN_PROGRAM_ID,
        })
        .rpc()

      return tx
    } catch (error) {
      console.error('Error finalizing game:', error)
      throw error
    }
  }

  async getGameState(gamePDA) {
    try {
      const gameAccount = await this.program.account.game.fetch(gamePDA)
      return gameAccount
    } catch (error) {
      console.error('Error fetching game state:', error)
      throw error
    }
  }
}

export function getGamePDA(gameId, programId = PROGRAM_ID) {
  return PublicKey.findProgramAddress(
    [Buffer.from('game'), new web3.BN(gameId).toArrayLike(Buffer, 'le', 8)],
    programId
  )
}