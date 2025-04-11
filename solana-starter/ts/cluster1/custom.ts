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
import { SystemProgram , PublicKey, Connection, Commitment, Keypair } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID, mintTo,setAuthority,AuthorityType,createSetAuthorityInstruction } from "@solana/spl-token";
import { createMint } from "@solana/spl-token";
// Define our Mint address
// const mint = publicKey("3hLPKuauwNyDjxESs7o2596pz1Fua3A64ye57PxdipTP")

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

const token_decimals = 1_000_000n;


(async () => {
    try {

        // Fungible Asset Example , We set the decimals to 0 when creating the mint
        const mint_Fungible_asset = await createMint(connection,
            mint_keypair,
            mint_keypair.publicKey,
            mint_keypair.publicKey,
            0);
        console.log(`Mint created: ${mint_Fungible_asset}`);

        const mint_pubkey = new PublicKey(mint_Fungible_asset);

        // Create a ATA for the mint
        const ata = await getOrCreateAssociatedTokenAccount(connection,
            mint_keypair,
            mint_Fungible_asset,
            mint_keypair.publicKey);
        console.log(`ATA created: ${ata.address.toBase58()}`);

        // Mint to the ATA
        const mintTx = await mintTo(connection,
            mint_keypair,
            mint_Fungible_asset,
            ata.address,
            mint_keypair.publicKey,
            1);
        console.log(`Mint tx: ${mintTx}`);

        

        // const metadata_seeds = [s
        //     Buffer.from("metadata"),
        //     new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID).toBuffer(),
        //     new PublicKey(mint).toBuffer(),
        // ]

        const metadata_seeds = [
            Buffer.from("metadata"),
            new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID).toBuffer(),
            new PublicKey(mint_pubkey).toBuffer(),
            
        ]

        console.log(metadata_seeds);

        const [meta_data_pda , bump ] = PublicKey.findProgramAddressSync(
            metadata_seeds,
            new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID)
        );

        const edition_seeds = [
            Buffer.from("metadata"),
            new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID).toBuffer(),
            new PublicKey(mint_pubkey.toBase58()).toBuffer(),
            Buffer.from("edition"),
        ]
        
        const [masterEditionPDA, __bump] = PublicKey.findProgramAddressSync(
            edition_seeds,
            new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID)
        );

        console.log(meta_data_pda.toBase58());
        console.log(bump);


        // // Start here
        let accounts: CreateMetadataAccountV3InstructionAccounts = {
            mint: publicKey(mint_pubkey.toBase58()),
            mintAuthority: signer,
            payer: signer,
        }

        console.log("Here 88");




        let data: DataV2Args = {
            name: "zero_master_edition",
            symbol: "ZMF",
            uri: "https://arweave.net/123456",
            sellerFeeBasisPoints: 100,
            creators: null,
            collection: null,
            uses: null,
        }

        console.log("Here 103");

        let args: CreateMetadataAccountV3InstructionArgs = {
            data: data,
            isMutable: true,
            collectionDetails: null,
        }

        console.log("Here 111");

        let tx = createMetadataAccountV3(
            umi,
            {
                ...accounts,
                ...args
            }
        )

        console.log("Here 115");

        let result = await tx.sendAndConfirm(umi,{send: { skipPreflight: true }});
        console.log(bs58.encode(result.signature));
        
        console.log("Here 120");

        // Tranfer mint and freeze authority of mint_Fungible_asset to edition
    //    const mintAuthorityTx = await setAuthority(
    //         connection,
    //         mint_keypair,
    //         mint_Fungible_asset,
    //         mint_keypair.publicKey,
    //         AuthorityType.MintTokens,
    //         masterEditionPDA
    //     )
    //     console.log(`mint authority tx: ${mintAuthorityTx}`);
        
        // const freezeAuthorityTx = await setAuthority(
        //     connection,
        //     mint_keypair,
        //     mint_Fungible_asset,
        //     mint_keypair.publicKey,
        //     AuthorityType.FreezeAccount,
        //     masterEditionPDA
        // )
        // console.log(`freeze tx: ${freezeAuthorityTx}`);

        const masterEditionAccounts: CreateMasterEditionV3InstructionAccounts = {
            edition: publicKey(masterEditionPDA.toBase58()),
            mint: publicKey(mint_pubkey.toBase58()),
            mintAuthority: signer,
            metadata: publicKey(meta_data_pda.toBase58()),
            updateAuthority: signer,


        }
        console.log("Here 127");
        const masterEditionArgs: CreateMasterEditionV3InstructionArgs = {
            maxSupply: 1,
        }
        console.log("Here 131");
        const masterEdition = createMasterEditionV3(
            umi,
            {
                ...masterEditionAccounts,
                ...masterEditionArgs
            }
        )

        console.log("Here");

        let result_masterEdition = await masterEdition.sendAndConfirm(umi,{send:{skipPreflight: true}})
        console.log(bs58.encode(result_masterEdition.signature));
    } catch(e) {
        console.error(`Oops, something went wrong:`, e);
        if (e instanceof Error) {
            console.error(e.message);
            console.error(e.stack);
        }
    }
})();
