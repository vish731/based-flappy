export const BASE_CHAIN_ID = '0x2105' // Base Mainnet = 8453

// ⚠️ APNA WALLET ADDRESS YAHAN DAALO
export const PRIZE_WALLET = '0xYourWalletAddressHere'

// 0.00005 ETH in hex wei
export const ENTRY_FEE_HEX = '0x2386F26FC10000'

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

