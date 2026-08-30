export const BASE_CHAIN_ID = '0x2105' // Base Mainnet = 8453

// BasedFlappy Prize Pool Contract (deployed on Base)
export const CONTRACT_ADDRESS = '0x2dDF84E248c369CfFD3024a70619baB1023032A6'

// keccak256("enterContest()") first 4 bytes — VERIFIED correct selector
export const ENTER_CONTEST_SELECTOR = '0x5d8a0425'

// 0.000125 ETH in hex wei = 125000000000000 wei
export const ENTRY_FEE_HEX = '0x71afd498d000'

// ERC-8021 Builder Code suffix for Base attribution
export const BUILDER_SUFFIX = '0x62635f6b3974653938633380218021802180218021802180218021'

export const BASE_CHAIN_CONFIG = {
  chainId: BASE_CHAIN_ID,
  chainName: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://mainnet.base.org'],
  blockExplorerUrls: ['https://basescan.org'],
}

export function getProvider() {
  if (typeof window === 'undefined') return null
  if (!window.ethereum) return null
  if (window.ethereum.providers) {
    return (
      window.ethereum.providers.find((p) => p.isMetaMask) ||
      window.ethereum.providers.find((p) => p.isCoinbaseWallet) ||
      window.ethereum.providers[0]
    )
  }
  return window.ethereum
}

export function hasProvider() {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
}

export function isMobileDevice() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

export function isIOSDevice() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function detectWalletName() {
  const p = getProvider()
  if (!p) return null
  if (p.isMetaMask) return 'MetaMask'
  if (p.isTrust) return 'Trust'
  if (p.isCoinbaseWallet) return 'Coinbase'
  if (p.isOKExWallet || p.isOkxWallet) return 'OKX'
  return 'Wallet'
}

export function getDeepLinks() {
  const u = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')
  return {
    open: `https://metamask.app.link/dapp/${u}`,
    install: isIOSDevice()
      ? 'https://apps.apple.com/app/metamask/id1438144202'
      : 'https://play.google.com/store/apps/details?id=io.metamask',
  }
}

export async function checkNetwork() {
  const p = getProvider()
  if (!p) return false
  try {
    const chainId = await p.request({ method: 'eth_chainId' })
    return chainId === BASE_CHAIN_ID
  } catch {
    return false
  }
}

export async function switchToBase() {
  const p = getProvider()
  if (!p) return
  try {
    await p.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: BASE_CHAIN_ID }] })
  } catch (e) {
    if (e.code === 4902) {
      try {
        await p.request({ method: 'wallet_addEthereumChain', params: [BASE_CHAIN_CONFIG] })
      } catch {
        alert('Could not add Base network. Please add it manually.')
      }
    }
  }
}
