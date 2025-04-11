import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "../wba-wallet.json"
import { getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("3hLPKuauwNyDjxESs7o2596pz1Fua3A64ye57PxdipTP");

// Recipient address
const to = new PublicKey("6BeJxrxywtGBhspLtzRNbYqcTurWAFfnc57bEErphXaT");

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, keypair.publicKey);

        // Get the token account of the toWallet address, and if it does not exist, create it
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, to);
        // Transfer the new token to the "toTokenAccount" we just created

        const transferTx = await transfer(connection,keypair,fromTokenAccount.address,toTokenAccount.address,keypair.publicKey,500n);
        console.log(`Your transfer txid: ${transferTx}`);

        // Verify the transfer
        const fromTokenAccount2 = await getAssociatedTokenAddress(mint, keypair.publicKey, false);
        const fromTokenAccountData = await connection.getTokenAccountBalance(fromTokenAccount2);
        console.log(fromTokenAccountData);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();