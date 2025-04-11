import {Connection , Keypair , LAMPORTS_PER_SOL} from "@solana/web3.js";
import wallet from "./keypair.json";

const connection = new Connection("https://api.devnet.solana.com");

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet.secretKey));

new Connection("https://api.devnet.solana.com");

(async () => {
    try {
        const txhash = await connection.requestAirdrop(keypair.publicKey,2*LAMPORTS_PER_SOL);
        console.log(`Airdrop transaction hash: https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
    } catch (error) {
        console.error(`Error requesting airdrop: ${error}`);
    }
})();