# Legacy3

## Environment Setup
1. Install [Rust](https://www.rust-lang.org/tools/install).
2. Install [Solana](https://docs.solana.com/cli/install-solana-cli-tools) and then run `solana-keygen new` to create a keypair at the default location.
3. Install [Anchor](https://www.anchor-lang.com/docs/installation).

## Pre-check before build
- Run ```anchor keys list``` copy it into your `declare_id!` macro at the top of `lib.rs`
- Update config value for super admin pubkey in `lib.rs`. See: [Source](https://github.com/artemislab-co/legacy3-contract/blob/aa0b291ea170b8665cd29d868bb745bbd46756fb/programs/legacy3/src/lib.rs#L22)

## Deploy Step by Step:
- **Step 1:** Run ```anchor build```
- **Step 2:** Change the `provider.cluster` variable in `Anchor.toml` to rpc endpoint of your choice or use `mainnet`.
- **Step 3:** Run ```anchor deploy -p legacy3 -- --commitment confirmed```
- **Step 4:** Save all of the file in folder `target/deploy` to upgrade program