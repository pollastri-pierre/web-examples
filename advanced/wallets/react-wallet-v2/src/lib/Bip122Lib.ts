import * as bip39 from 'bip39'
import { BIP32Factory, BIP32Interface } from 'bip32'
import * as ecc from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib'
import { BIP122_CHAINS } from '@/data/Bip122Data' 
import * as bitcoinMessage from 'bitcoinjs-message'
/**
 * Types
 */
interface IInitArguments {
    mnemonic?: string
}

interface IChainData {
    network: bitcoin.Network,
    coinType: number,
}

const bip32 = BIP32Factory(ecc);

function generateChainsData(): Map<string, IChainData> {
    const chains = new Map<string, IChainData>()
    for (const caip2 in BIP122_CHAINS) {
        switch(caip2) {
            case 'bip122:000000000019d6689c085ae165831e93':
                chains.set(caip2, {
                    network: bitcoin.networks.bitcoin,
                    coinType: 0,
                });
            break;
            case 'bip122:12a765e31ffd4059bada1e25190f6e98':
                chains.set(caip2, {
                    network: {
                        messagePrefix: '\x19Litecoin Signed Message:\n',
                        bech32: 'ltc',
                        bip32: {
                          public: 0x019da462,
                          private: 0x019d9cfe,
                        },
                        pubKeyHash: 0x30,
                        scriptHash: 0x32,
                        wif: 0xb0,
                    },
                    coinType: 2,
                });
                break;
            case 'bip122:000000000933ea01ad0ee984209779ba':
                chains.set(caip2, {
                    network: bitcoin.networks.testnet,
                    coinType: 1,
                });
                break;
            default:
                console.warn(`Chain ${caip2} not supported (fallback to testnet)`)
                chains.set(caip2, {
                    network: bitcoin.networks.testnet,
                    coinType: 1,
                });
                break;
            }  
    }
    return chains;
}

export default class Bip122Lib {
    private _seed: Uint8Array;
    private _mnemonic: string;
    private _chains
    constructor(seed: Uint8Array, mnemonic: string) {
        this._seed = seed;
        this._mnemonic = mnemonic;

        // Generate chains data
        this._chains = generateChainsData();
    }

    public getMnemonic() {
        return this._mnemonic;
    }

    public getChains() {
        return this._chains;
    }

    /// Get the addresses for all supported chains at the given derivation offsets
    public getAddressMap(internal: number, index: number): Map<string, string> {
       // For all supported chains
        const addresses = new Map<string, string>()
        this.getChains().forEach((chainData, caip2) => {
            const { network, coinType } = chainData;
            const path = `m/44'/${coinType}'/${internal}'/${index}`
            const node = bip32.fromSeed(Buffer.from(this._seed), network).derivePath(path)
            const address = bitcoin.payments.p2pkh({ pubkey: node.publicKey, network }).address
            if (address) {
                addresses.set(caip2, address)
            }
        })
        return addresses;
    }

    private findPrivate(address: string): {chain: IChainData, node: BIP32Interface} {
        // For this PoC wallet we consider to only derive 0/0
        let chain: IChainData | undefined;
        let node: BIP32Interface | undefined;

        this.getChains().forEach((chainData, caip2) => {
            const { network, coinType } = chainData;
            const path = `m/44'/${coinType}'/${0}'/${0}`
            const derivedNode = bip32.fromSeed(Buffer.from(this._seed), network).derivePath(path)
            const derivedAddress = bitcoin.payments.p2pkh({ pubkey: derivedNode.publicKey, network }).address
            if (derivedAddress == address) {
                chain = chainData;
                node = derivedNode;
            }
        })
        if (!chain || !node) {
            throw new Error('Address not found')
        }
        return { chain, node }
    }

    public signMessage(fromAddress: string, message: string): Uint8Array {
        // Find private key and chain from address
        let { chain, node } = this.findPrivate(fromAddress)
        return bitcoinMessage.sign(message, node.privateKey!, true, chain.network.messagePrefix);
    }

    static async init({ mnemonic }: IInitArguments) {
        if (!mnemonic || !bip39.validateMnemonic(mnemonic)) {
            mnemonic = bip39.generateMnemonic()
            
        }
        const seed = await bip39.mnemonicToSeed(mnemonic)
        return new Bip122Lib(seed, mnemonic);
    }

}