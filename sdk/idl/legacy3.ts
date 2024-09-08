/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/legacy3.json`.
 */
export type Legacy3Type = {
  "address": "6UuZRxtnqQJqtTy98gAZGbg59TF5VyNETPxnubQgXwso",
  "metadata": {
    "name": "legacy3",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claimConnectionFee",
      "discriminator": [
        15,
        33,
        89,
        190,
        113,
        185,
        83,
        150
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "connection",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  110,
                  101,
                  99,
                  116,
                  105,
                  111,
                  110,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "connection.sender",
                "account": "connection"
              },
              {
                "kind": "account",
                "path": "connection.receiver",
                "account": "connection"
              }
            ]
          }
        },
        {
          "name": "connectionVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  110,
                  101,
                  99,
                  116,
                  105,
                  111,
                  110,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "connection"
              }
            ]
          }
        },
        {
          "name": "receiver",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeCollection",
      "discriminator": [
        112,
        62,
        53,
        139,
        173,
        152,
        98,
        93
      ],
      "accounts": [
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "collection",
          "writable": true,
          "signer": true
        },
        {
          "name": "configTokenAccount",
          "docs": [
            "CHECK - address"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "configAccount"
              },
              {
                "kind": "account",
                "path": "collection"
              }
            ]
          }
        },
        {
          "name": "metadataAccount",
          "docs": [
            "CHECK - address"
          ],
          "writable": true
        },
        {
          "name": "masterEditionAccount",
          "writable": true
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "address": "6UuZRxtnqQJqtTy98gAZGbg59TF5VyNETPxnubQgXwso"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "tokenMetadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeConfig",
      "discriminator": [
        208,
        127,
        21,
        1,
        194,
        190,
        196,
        70
      ],
      "accounts": [
        {
          "name": "owner",
          "docs": [
            "Address to be set as protocol owner."
          ],
          "writable": true,
          "signer": true,
          "address": "6UuZRxtnqQJqtTy98gAZGbg59TF5VyNETPxnubQgXwso"
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "feeWallet"
        },
        {
          "name": "treasury"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "connectionFee",
          "type": "u64"
        },
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "mintNft",
      "discriminator": [
        211,
        57,
        6,
        167,
        15,
        219,
        35,
        251
      ],
      "accounts": [
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  102,
                  116,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "name"
              }
            ]
          }
        },
        {
          "name": "metadataAccount",
          "docs": [
            "CHECK - address"
          ],
          "writable": true
        },
        {
          "name": "masterEditionAccount",
          "writable": true
        },
        {
          "name": "collection",
          "docs": [
            "CHECK - address"
          ],
          "writable": true,
          "relations": [
            "configAccount"
          ]
        },
        {
          "name": "userTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "treasury",
          "writable": true,
          "relations": [
            "configAccount"
          ]
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "roleAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  101,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "configAccount"
              },
              {
                "kind": "account",
                "path": "operator"
              }
            ]
          }
        },
        {
          "name": "operator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenMetadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "payConnectionFee",
      "discriminator": [
        140,
        9,
        241,
        95,
        224,
        233,
        10,
        34
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "roleAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  101,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "account",
                "path": "operator"
              }
            ]
          }
        },
        {
          "name": "connection",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  110,
                  101,
                  99,
                  116,
                  105,
                  111,
                  110,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "sender"
              },
              {
                "kind": "account",
                "path": "receiver"
              }
            ]
          }
        },
        {
          "name": "connectionVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  110,
                  101,
                  99,
                  116,
                  105,
                  111,
                  110,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "connection"
              }
            ]
          }
        },
        {
          "name": "receiver"
        },
        {
          "name": "operator",
          "writable": true,
          "signer": true
        },
        {
          "name": "sender",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "solAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "refundConnectionFee",
      "discriminator": [
        128,
        157,
        80,
        28,
        239,
        101,
        131,
        109
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "roleAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  101,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "account",
                "path": "operator"
              }
            ]
          }
        },
        {
          "name": "connection",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  110,
                  101,
                  99,
                  116,
                  105,
                  111,
                  110,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "connection.sender",
                "account": "connection"
              },
              {
                "kind": "account",
                "path": "connection.receiver",
                "account": "connection"
              }
            ]
          }
        },
        {
          "name": "connectionVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  110,
                  101,
                  99,
                  116,
                  105,
                  111,
                  110,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "connection"
              }
            ]
          }
        },
        {
          "name": "sender"
        },
        {
          "name": "operator",
          "docs": [
            "Address to be set as operator."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "setRole",
      "discriminator": [
        77,
        78,
        62,
        233,
        192,
        61,
        199,
        190
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "roleAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  108,
                  101,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user"
        },
        {
          "name": "owner",
          "docs": [
            "Address to be set as protocol owner."
          ],
          "writable": true,
          "signer": true,
          "address": "6UuZRxtnqQJqtTy98gAZGbg59TF5VyNETPxnubQgXwso"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "role",
          "type": {
            "defined": {
              "name": "role"
            }
          }
        },
        {
          "name": "active",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updateConfig",
      "discriminator": [
        29,
        158,
        252,
        191,
        10,
        83,
        219,
        99
      ],
      "accounts": [
        {
          "name": "owner",
          "docs": [
            "Address to be set as protocol owner."
          ],
          "writable": true,
          "signer": true,
          "address": "6UuZRxtnqQJqtTy98gAZGbg59TF5VyNETPxnubQgXwso"
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "newFeeWallet",
          "optional": true
        },
        {
          "name": "treasury",
          "optional": true
        }
      ],
      "args": [
        {
          "name": "connectionFee",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "price",
          "type": {
            "option": "u64"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    },
    {
      "name": "connection",
      "discriminator": [
        209,
        186,
        115,
        58,
        36,
        236,
        179,
        10
      ]
    },
    {
      "name": "roleAccount",
      "discriminator": [
        142,
        236,
        135,
        197,
        214,
        3,
        244,
        226
      ]
    }
  ],
  "events": [
    {
      "name": "claimConnectFeeEvent",
      "discriminator": [
        88,
        246,
        159,
        160,
        43,
        157,
        77,
        140
      ]
    },
    {
      "name": "initializeCollectionEvent",
      "discriminator": [
        70,
        144,
        253,
        250,
        75,
        87,
        235,
        55
      ]
    },
    {
      "name": "initializeConfigEvent",
      "discriminator": [
        115,
        64,
        125,
        137,
        211,
        17,
        190,
        43
      ]
    },
    {
      "name": "mintNftEvent",
      "discriminator": [
        176,
        112,
        170,
        107,
        46,
        35,
        212,
        160
      ]
    },
    {
      "name": "payConnectFeeEvent",
      "discriminator": [
        79,
        80,
        109,
        178,
        105,
        45,
        245,
        80
      ]
    },
    {
      "name": "refundConnectFeeEvent",
      "discriminator": [
        35,
        96,
        10,
        223,
        253,
        163,
        208,
        33
      ]
    },
    {
      "name": "setRoleEvent",
      "discriminator": [
        153,
        146,
        95,
        123,
        29,
        113,
        211,
        16
      ]
    },
    {
      "name": "updateConfigEvent",
      "discriminator": [
        96,
        112,
        253,
        102,
        59,
        78,
        75,
        134
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6001,
      "name": "invalidFeeWallet",
      "msg": "Invalid fee wallet"
    },
    {
      "code": 6002,
      "name": "invalidTreasury",
      "msg": "Invalid treasury"
    },
    {
      "code": 6003,
      "name": "connectionFeeTooHigh",
      "msg": "Connection fee too high"
    },
    {
      "code": 6004,
      "name": "invalidPrice",
      "msg": "Connection price"
    },
    {
      "code": 6005,
      "name": "invalidConnectionStatus",
      "msg": "Invalid connection status"
    },
    {
      "code": 6006,
      "name": "invalidSolAmount",
      "msg": "Invalid sol amount"
    },
    {
      "code": 6007,
      "name": "collectionAlreadyInitialized",
      "msg": "Collection already initialized"
    }
  ],
  "types": [
    {
      "name": "claimConnectFeeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "connection",
            "type": "pubkey"
          },
          {
            "name": "sender",
            "type": "pubkey"
          },
          {
            "name": "receiver",
            "type": "pubkey"
          },
          {
            "name": "solAmount",
            "type": "u64"
          },
          {
            "name": "connectionStatus",
            "type": {
              "defined": {
                "name": "connectionStatus"
              }
            }
          }
        ]
      }
    },
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "docs": [
              "Config version"
            ],
            "type": "u8"
          },
          {
            "name": "bump",
            "docs": [
              "Bump to identify PDA"
            ],
            "type": "u8"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "feeWallet",
            "type": "pubkey"
          },
          {
            "name": "collection",
            "type": "pubkey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "connectionFee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "connection",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "docs": [
              "Connection version"
            ],
            "type": "u8"
          },
          {
            "name": "bump",
            "docs": [
              "Bump to identify PDA"
            ],
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          },
          {
            "name": "sender",
            "type": "pubkey"
          },
          {
            "name": "receiver",
            "type": "pubkey"
          },
          {
            "name": "solAmount",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "connectionStatus"
              }
            }
          }
        ]
      }
    },
    {
      "name": "connectionStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "opened"
          },
          {
            "name": "connected"
          },
          {
            "name": "refunded"
          }
        ]
      }
    },
    {
      "name": "initializeCollectionEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "collection",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "configAccount",
            "type": "pubkey"
          },
          {
            "name": "collectionName",
            "type": "string"
          },
          {
            "name": "collectionSymbol",
            "type": "string"
          },
          {
            "name": "collectionUri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "initializeConfigEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "feeWallet",
            "type": "pubkey"
          },
          {
            "name": "connectionFee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "mintNftEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mintAddress",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "configAccount",
            "type": "pubkey"
          },
          {
            "name": "nftName",
            "type": "string"
          },
          {
            "name": "nftSymbol",
            "type": "string"
          },
          {
            "name": "nftUri",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "payConnectFeeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "connection",
            "type": "pubkey"
          },
          {
            "name": "connectionVault",
            "type": "pubkey"
          },
          {
            "name": "sender",
            "type": "pubkey"
          },
          {
            "name": "receiver",
            "type": "pubkey"
          },
          {
            "name": "solAmount",
            "type": "u64"
          },
          {
            "name": "connectionStatus",
            "type": {
              "defined": {
                "name": "connectionStatus"
              }
            }
          }
        ]
      }
    },
    {
      "name": "refundConnectFeeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "connection",
            "type": "pubkey"
          },
          {
            "name": "operator",
            "type": "pubkey"
          },
          {
            "name": "sender",
            "type": "pubkey"
          },
          {
            "name": "solAmount",
            "type": "u64"
          },
          {
            "name": "connectionStatus",
            "type": {
              "defined": {
                "name": "connectionStatus"
              }
            }
          }
        ]
      }
    },
    {
      "name": "role",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "operator"
          },
          {
            "name": "minter"
          }
        ]
      }
    },
    {
      "name": "roleAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "docs": [
              "User pubkey associated with the role"
            ],
            "type": "pubkey"
          },
          {
            "name": "role",
            "docs": [
              "Role of the user"
            ],
            "type": {
              "defined": {
                "name": "role"
              }
            }
          },
          {
            "name": "active",
            "docs": [
              "Flag to control if the role is active"
            ],
            "type": "bool"
          },
          {
            "name": "bump",
            "docs": [
              "Bump to identify PDA"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "setRoleEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "role",
            "type": {
              "defined": {
                "name": "role"
              }
            }
          },
          {
            "name": "active",
            "type": "bool"
          },
          {
            "name": "config",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "updateConfigEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "feeWallet",
            "type": "pubkey"
          },
          {
            "name": "connectionFee",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "configSeed",
      "type": "bytes",
      "value": "[99, 111, 110, 102, 105, 103, 95, 115, 101, 101, 100]"
    },
    {
      "name": "configTokenSeed",
      "type": "bytes",
      "value": "[99, 111, 110, 102, 105, 103, 95, 116, 111, 107, 101, 110, 95, 115, 101, 101, 100]"
    },
    {
      "name": "connectionSeed",
      "type": "bytes",
      "value": "[99, 111, 110, 110, 101, 99, 116, 105, 111, 110, 95, 115, 101, 101, 100]"
    },
    {
      "name": "connectionVaultSeed",
      "type": "bytes",
      "value": "[99, 111, 110, 110, 101, 99, 116, 105, 111, 110, 95, 118, 97, 117, 108, 116, 95, 115, 101, 101, 100]"
    },
    {
      "name": "edition",
      "type": "string",
      "value": "\"edition\""
    },
    {
      "name": "nftMintSeed",
      "type": "bytes",
      "value": "[110, 102, 116, 95, 109, 105, 110, 116, 95, 115, 101, 101, 100]"
    },
    {
      "name": "prefix",
      "type": "string",
      "value": "\"metadata\""
    },
    {
      "name": "roleSeed",
      "type": "bytes",
      "value": "[114, 111, 108, 101, 95, 115, 101, 101, 100]"
    }
  ]
};
