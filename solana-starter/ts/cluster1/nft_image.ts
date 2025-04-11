import wallet from "../wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"
import { readFile } from "fs/promises"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        //1. Load image
        //2. Convert image to generic file.
        //3. Upload image
        // http://devnet.irys.xyz/3xWt7319GC36KbnTRaHgLmDJ8oF3tuL7METW6NgMsNkk

        const image = await readFile("./cluster1/assets/jeff.png");
        const genericFile = await createGenericFile(image,"jeff.png",{contentType: "image/png"});
        const [imguri] = await umi.uploader.upload([genericFile]);
       
        console.log("Your image URI: ", imguri);
   
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
