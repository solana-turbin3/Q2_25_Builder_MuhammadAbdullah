import {Connection , Keypair , LAMPORTS_PER_SOL , Transaction, SystemProgram,sendAndConfirmTransaction,PublicKey} from "@solana/web3.js";

import wallet from "./keypair.json";

const connection = new Connection("https://api.devnet.solana.com");

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet.secretKey));

const recipient = new PublicKey("Wn18yuSRbosrLtwwbEggFTM6vwneHvdJYn1m5ythWQ8");

// (
//     async () => {
//         try {
//             const transaction = new Transaction().add(
//                 SystemProgram.transfer({
//                     fromPubkey: keypair.publicKey,
//                     toPubkey: recipient,
//                     lamports: LAMPORTS_PER_SOL / 100,
//                 })
//             );
//             transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
//             transaction.feePayer = keypair.publicKey;
            
//             const signature = await sendAndConfirmTransaction(connection,transaction,[keypair]);

//             console.log(`Transfer transaction hash: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
//         } catch (error) {
//             console.error(`Error transferring SOL: ${error}`);
//         }
//     }
// )();

(
    async () => {
        try {
            const balance = await connection.getBalance(keypair.publicKey);
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: keypair.publicKey,
                    toPubkey: recipient,
                    lamports: balance,
                })
            );

            transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
            transaction.feePayer = keypair.publicKey;

            const fee = (await connection.getFeeForMessage(transaction.compileMessage(),
            'confirmed')).value || 0;

            transaction.instructions.pop();

            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: keypair.publicKey,
                    toPubkey: recipient,
                    lamports : balance - fee,
                })
            );

            const signature = await sendAndConfirmTransaction(connection,transaction,[keypair]);
            console.log(`Success, tx Hash:, https://explorer.solana.com/tx/${signature}?cluster=devnet`);



            
        } catch (error) {
            console.error('Something is wrong',error);
            
        }
    }
)();
