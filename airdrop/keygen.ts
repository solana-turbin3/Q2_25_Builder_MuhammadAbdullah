import { Keypair } from "@solana/web3.js";

const keypair = Keypair.generate();

console.log(keypair.publicKey.toBase58());
console.log(keypair.secretKey);

// Save to a Json file
const fs = require('fs');
const path = require('path');

const keypairPath = path.join(__dirname, 'keypair.json');

// write public key and secret key to a json file , the secret key should be Uint8Array(64) , stringify the Uint8Array
fs.writeFileSync(keypairPath, JSON.stringify({
    publicKey: keypair.publicKey.toBase58(),
    secretKey: Array.from(keypair.secretKey)
}));

console.log(`Keypair saved to ${keypairPath}`);

