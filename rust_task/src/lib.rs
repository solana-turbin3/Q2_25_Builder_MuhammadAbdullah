mod programs;



#[cfg(test)]
mod tests {
    use super::*;
    use solana_sdk::{
        message::Message, signature::{read_keypair_file, Keypair, Signer}, transaction::Transaction
        
    };
    use solana_program::{
        system_instruction::transfer,
        pubkey::Pubkey,hash::hash,
        system_program
    };

    
    use crate::programs::turbine_prereq::{TurbinePrereqProgram, CompleteArgs};
    use solana_client::rpc_client::RpcClient;
    use std::str::FromStr;

    const RPC_URL: &str = "https://api.devnet.solana.com";

    
    pub const LAMPORTS_PER_SOL: u64 = 1_000_000_000;

    #[test]
    fn keygen(){
        let kp = Keypair::new();
        println!("KP: {}", kp.pubkey());

        println!("{:?}", kp.to_bytes());

    }

    #[test]
    fn airdrop(){
        let keypair = read_keypair_file("dev-wallet.json").expect("Couldn't find wallet file");
         let client = RpcClient::new(RPC_URL);
        match client.request_airdrop(&keypair.pubkey(), 2 * LAMPORTS_PER_SOL){
            Ok(s) => {
                println!("Success! Check out your TX here:");
                println!("https://explorer.solana.com/tx/{}?cluster=devnet", s.to_string());
                
            }
            Err(_) => {
                println!("Failed to request airdrop");
            }
        };
    }

    #[test]
    fn transfer_sol(){
        let keypair = read_keypair_file("dev-wallet.json").expect("Couldn't find wallet file");
        let pubkey = keypair.pubkey();

        let message_bytes = b"I verify my solana Keypair";
        let sig = keypair.sign_message(message_bytes);
        let sig_hashed = hash(sig.as_ref());

        match sig.verify(pubkey.to_bytes().as_ref(), sig_hashed.to_bytes().as_ref()){
            true => println!("Signature verified"),
            false => println!("Signature verification failed"),
        
        }

        let to_pubkey = Pubkey::from_str("Wn18yuSRbosrLtwwbEggFTM6vwneHvdJYn1m5ythWQ8").unwrap();

        let rpc_client = RpcClient::new(RPC_URL);

        let recent_blockhash = rpc_client.get_latest_blockhash().expect("Failed to get blockhash");

        // let tx = Transaction::new_signed_with_payer(&[transfer(&pubkey, &to_pubkey, 1_000_000)], 
        // Some(&pubkey), &[&keypair], recent_blockhash);

        // let sig = rpc_client.send_and_confirm_transaction(&tx).expect("Failed to send transaction");

        // println!("Success! Check out your TX here:");
        // println!("https://explorer.solana.com/tx/{}?cluster=devnet", sig.to_string());

        let balance = rpc_client.get_balance(&pubkey).expect("Failed to get balance");

        

        let message = Message::new_with_blockhash(&[transfer(&pubkey, &to_pubkey, balance)], Some(&keypair.pubkey()), &recent_blockhash);

        let fee = rpc_client.get_fee_for_message(&message).expect("Failed to get fee");

        println!("Fee: {}", fee);

        let tx: Transaction = Transaction::new_signed_with_payer(&[transfer(&pubkey, &to_pubkey, balance - fee)], 
        Some(&pubkey), &[&keypair], recent_blockhash);
        let sig = rpc_client.send_and_confirm_transaction(&tx).expect("Failed to send transaction");

        println!("Success! Check out your TX here:");
        println!("https://explorer.solana.com/tx/{}?cluster=devnet", sig.to_string());


    }

    #[test]
    fn enroll_prereq(){
        let signer = read_keypair_file("Turbin3-wallet.json").expect("Couldn't find wallet file");

        let client = RpcClient::new(RPC_URL);

       //  let signer = Signer::new(&keypair);

        let prereq_pda = TurbinePrereqProgram::derive_program_address(&[b"prereq",signer.pubkey().to_bytes().as_ref()]);

        println!("Prereq PDA: {}", prereq_pda);

        let args = CompleteArgs{
        github: b"mabdullah22".to_vec()
        };

        let recent_blockhash = client.get_latest_blockhash().expect("Failed to get blockhash");

        let tx = TurbinePrereqProgram::complete(
            &[&signer.pubkey(), &prereq_pda, &system_program::ID],&args, Some(&signer.pubkey()), &[&signer], recent_blockhash);

        let sig = client.send_and_confirm_transaction(&tx).expect("Failed to send transaction");
        
        println!("Success! Check out your TX here:");
        println!("https://explorer.solana.com/tx/{}?cluster=devnet", sig.to_string());
        

    }
}
