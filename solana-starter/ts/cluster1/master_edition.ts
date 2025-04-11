import wallet from "../dev-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { 
    createMetadataAccountV3, 
    CreateMetadataAccountV3InstructionAccounts, 
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args,MPL_TOKEN_METADATA_PROGRAM_ID,
    createMasterEditionV3,
    CreateMasterEditionV3InstructionAccounts,
    CreateMasterEditionV3InstructionArgs
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { SystemProgram , PublicKey, Connection, Commitment, Keypair} from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID, mintTo } from "@solana/spl-token";
import { createMint } from "@solana/spl-token";
// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));


const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

// Create a Solana devnet connection
const mint_keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
const commitment: Commitment = "confirmed";
// const connection = new Connection("https://devnet.helius-rpc.com/?api-key=73d13122-848e-41f1-8342-baee1fe67bb9", commitment);
const connection = new Connection("https://api.devnet.solana.com", commitment);

(async () => {
    try {
        // Create a mint account
        const mint = await createMint(connection,mint_keypair,mint_keypair.publicKey,null,0);
        console.log(`Mint created: ${mint}`);

        // Create a ATA for the mint
        const ata = await getOrCreateAssociatedTokenAccount(connection,mint_keypair,mint,mint_keypair.publicKey);
        console.log(`ATA created: ${ata.address.toBase58()}`);

        // Mint to the ATA
        const mintTx = await mintTo(connection,mint_keypair,mint,ata.address,mint_keypair.publicKey,1);
        console.log(`Mint tx: ${mintTx}`);

        
        // Create a metadata account
        let data: DataV2Args = {
            name: "zero_master_edition",
            symbol: "ZM",
            uri: "https://arweave.net/123456",
            sellerFeeBasisPoints: 100,
            creators: null,
            collection: null,
            uses: null,
        }
        // Create a metadata account
        const edition_seeds = [
            Buffer.from("metadata"),
            new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID).toBuffer(),
            new PublicKey(mint.toBase58()).toBuffer(),
            Buffer.from("edition"),
        ]

        const [masterEditionPDA, __bump] = PublicKey.findProgramAddressSync(
            edition_seeds,
            new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID)
        );

        console.log(`Master Edition created: ${masterEditionPDA}`);

        let accounts: CreateMetadataAccountV3InstructionAccounts = {
            mint: publicKey(mint.toBase58()),
            mintAuthority: signer,
            payer: signer,
        }

      

        

    } catch (error) {
        console.log(error);
    }
})()