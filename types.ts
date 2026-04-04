export interface GameConfig {
  version: string;
  network: string;
  entryFee: string;
}

export const config: GameConfig = {
  version: "1.0.0",
  network: "Base Mainnet",
  entryFee: "0.00005 ETH"
};
