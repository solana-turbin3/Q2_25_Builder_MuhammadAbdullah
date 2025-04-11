import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createSignerFromKeypair, signerIdentity, generateSigner, percentAmount } from "@metaplex-foundation/umi"
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

import wallet from "../wba-wallet.json"
import base58 from "bs58";

const RPC_ENDPOINT = "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata())

const mint = generateSigner(umi);



// https://solscan.io/token/43kNsz7LdR6ZM8Cc1nznuzwx3a24Eb2FMPY72x5zRRwd?cluster=devnet
(async () => {
    let tx = await createNft(umi,{
        mint,
        sellerFeeBasisPoints: percentAmount(5.5),
        name: "Cool Jeff",
        uri: "https://devnet.irys.xyz/AgnNkJxpVNHM9mvQvunE8UyUvG8oNdemPR1pDpUbV5vT",
    });
    let result = await tx.sendAndConfirm(umi);
    const signature = base58.encode(result.signature);
    
    console.log(`Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)

    console.log("Mint Address: ", mint.publicKey);
})();