/**
 * Types
 */
export type TBip122Chain = keyof typeof BIP122_MAINNET_CHAINS

export const BIP122_MAINNET_CHAINS = {
    'bip122:000000000019d6689c085ae165831e93': {
        chainId: '000000000019d6689c085ae165831e93',
        name: 'Bitcoin',
        logo: '/chain-logos/bitcoin.svg',
        rgb: '247, 147, 26',
        rpc: '',
        namespace: 'bip122'
      },
      'bip122:12a765e31ffd4059bada1e25190f6e98': {
        chainId: '12a765e31ffd4059bada1e25190f6e98',
        name: 'Litecoin',
        logo: '/chain-logos/litecoin.svg',
        rgb: '52, 93, 175',
        rpc: '',
        namespace: 'bip122'
      },
}

export const BIP122_TEST_CHAINS = {
    'bip122:000000000933ea01ad0ee984209779ba': {
        chainId: '000000000019d6689c085ae165831e93',
        name: 'Bitcoin (Testnet)',
        logo: '/chain-logos/bitcoin.svg',
        rgb: '247, 147, 26',
        rpc: '',
        namespace: 'bip122'
      },
}

export const BIP122_CHAINS = { ...BIP122_MAINNET_CHAINS, ...BIP122_TEST_CHAINS }

export const BIP122_METHODS = {
    BIP122_SIGN_MESSAGE: 'bip122_signMessage',
}
  