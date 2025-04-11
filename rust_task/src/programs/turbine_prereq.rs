use solana_idlgen::idlgen;

idlgen!{{
    "version": "0.1.0",
    "name": "turbine_prereq",
    "instructions": [
      {
        "name": "complete",
        "accounts": [
          {
            "name": "signer",
            "isSigner": true,
            "isMut": true
          },
          {
            "name": "prereq",
            "isMut": true,
            "isSigner": false,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [112, 114, 101, 114, 101, 113]
                },
                {
                  "kind": "account",
                  "path": "signer"
                }
              ]
            }
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "github",
            "type": "bytes"
          }
        ]
      }
    ],
    "metadata": {
      "address": "ADcaide4vBtKuyZQqdU689YqEGZMCmS4tL35bdTv9wJa"
    }
}}