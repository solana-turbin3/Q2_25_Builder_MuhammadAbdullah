import wallet from "../wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure
        // https://devnet.irys.xyz/AgnNkJxpVNHM9mvQvunE8UyUvG8oNdemPR1pDpUbV5vT

        const image = "http://devnet.irys.xyz/3xWt7319GC36KbnTRaHgLmDJ8oF3tuL7METW6NgMsNkk"
        const metadata = {
            name: "Cool Jeff",
            symbol: "CJ",
            description: "Jeff is a cool guy",
            image: image,
            attributes: [
                {trait_type: 'Age', value: '50'},
                {trait_type: 'Height', value: '180cm'},
                {trait_type: 'Weight', value: '80kg'},
                {trait_type: 'Eye Color', value: 'Blue'},
                {trait_type: 'Hair Color', value: 'Brown'},
                {trait_type: 'Gender', value: 'Male'},
                
            ],
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri: image
                    },
                ]
            },
            creators: []
        };

        const file = createGenericFile(JSON.stringify(metadata), "metadata.json", {contentType: "application/json"});

        const myUri = await umi.uploader.upload([file]);
        console.log("Your metadata URI: ", myUri);
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
