import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TurbineVault } from "../target/types/turbine_vault";

describe("turbine_vault", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.turbineVault as Program<TurbineVault>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
