# Deployments

## Base Mainnet (Live – Production)

| Component | Status / Link |
|-----------|---------------|
| Game Frontend | https://vish731.github.io/BASED-FLAPPY/ |
| Entry Payment | Manual – user sends 0.00005 ETH to pool address |
| Supported Wallets | MetaMask, Coinbase Wallet, Trust Wallet, Rainbow, Frame, etc. |
| Leaderboard DB | Supabase (bsmuxnnjclhcuecpybkp.supabase.co) |
| Prize Distribution | **Automatic within 24h** after contest ends. If automatic fails for any reason, **manual transfer is done** to ensure winners receive their ETH. |

## Base Sepolia (Not used – game is live on Mainnet only)

No testnet deployment needed.

## Next Steps
- Add smart contract to automate fees & payouts (remove manual fallback)
- Keep same entry fee & prize split
