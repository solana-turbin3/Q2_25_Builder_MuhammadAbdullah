import wallet from "../dev-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { 
    createMetadataAccountV3, 
    CreateMetadataAccountV3InstructionAccounts, 
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args,MPL_TOKEN_METADATA_PROGRAM_ID
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { SystemProgram , PublicKey} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// Define our Mint address
const mint = publicKey("3hLPKuauwNyDjxESs7o2596pz1Fua3A64ye57PxdipTP")

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

(async () => {
    try {


        const metadata_seeds = [
            Buffer.from("metadata"),
            new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID).toBuffer(),
            new PublicKey(mint).toBuffer(),
        ]

        const [pda , bump ] = PublicKey.findProgramAddressSync(
            metadata_seeds,
            new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID)
        );

        console.log(pda.toBase58());
        console.log(bump);


        // // Start here
        let accounts: CreateMetadataAccountV3InstructionAccounts = {
            mint: mint,
            mintAuthority: signer,
            payer: signer,
        }

        let data: DataV2Args = {
            name: "Test Token",
            symbol: "TEST",
            uri: "https://arweave.net/1234567890",
            sellerFeeBasisPoints: 100,
            creators: null,
            collection: null,
            uses: null,
        }

        let args: CreateMetadataAccountV3InstructionArgs = {
            data: data,
            isMutable: true,
            collectionDetails: null,
        }


        let tx = createMetadataAccountV3(
            umi,
            {
                ...accounts,
                ...args
            }
        )

        let result = await tx.sendAndConfirm(umi);
        console.log(bs58.encode(result.signature));
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();
