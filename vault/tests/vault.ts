import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { Vault } from "../target/types/vault";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("vault", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.vault as Program<Vault>;
  const provider = anchor.getProvider();
  const connection = provider.connection;
  const user = anchor.web3.Keypair.generate();
  
  before(async () => {
  // airdrop funds to user
  const airdropSignature = await connection.requestAirdrop(user.publicKey, anchor.web3.LAMPORTS_PER_SOL);
  await connection.confirmTransaction({
      signature: airdropSignature,
      ...(await provider.connection.getLatestBlockhash()),
    });
  });

  let vault

  it("Is initialized!", async () => {
    // Add your test here.

    const tx = await program.methods.initialize().accounts({
      user: user.publicKey,
    }).signers([user]).rpc();
    console.log("Your transaction signature", tx);
    
  });

  it("Deposit", async () => {
    const tx = await program.methods.deposit(new BN(2000000000000000000)).accounts({
      user: user.publicKey,
    }).signers([user]).rpc();
    console.log("Your transaction signature", tx);
  });

  it("Withdraw", async () => {
    const tx = await program.methods.withdraw(new BN(1000000000000000000)).accounts({
      user: user.publicKey,
    }).signers([user]).rpc();
    console.log("Your transaction signature", tx);
  });
});
