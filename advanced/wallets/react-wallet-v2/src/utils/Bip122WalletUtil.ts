import Bip122Lib from '@/lib/Bip122Lib'

export const DEFAULT_CHAIN_ID = 'bip122:000000000019d6689c085ae165831e93'
export let wallet1: Bip122Lib
export let wallet2: Bip122Lib
export let bip122Wallets: Record<string, Bip122Lib>
export let bip122Addresses: Map<string, string>[]
export let bip122AllAddresses: string[] = [];

let addresses1: Map<string, string>
let addresses2: Map<string, string>

export async function createOrRestoreBip122Wallets() {
    const mnemonic1 = localStorage.getItem('BIP122_MNEMONIC_1')
    const mnemonic2 = localStorage.getItem('BIP122_MNEMONIC_2')
  
    if (mnemonic1 && mnemonic2) {
      wallet1 = await Bip122Lib.init({ mnemonic: mnemonic1 })
      wallet2 = await Bip122Lib.init({ mnemonic: mnemonic2 })
    } else {
      wallet1 = await Bip122Lib.init({})
      wallet2 = await Bip122Lib.init({})
  
      // Don't store mnemonic in local storage in a production project!
      localStorage.setItem('BIP122_MNEMONIC_1', wallet1.getMnemonic())
      localStorage.setItem('BIP122_MNEMONIC_2', wallet2.getMnemonic())
    }
    addresses1 = await wallet1.getAddressMap(0, 0)
    addresses2 = await wallet2.getAddressMap(0, 0)


    bip122Wallets = {}
    addresses1.forEach((address, caip2) => {
        bip122Wallets[address] = wallet1
        bip122AllAddresses.push(address)
    })
    addresses2.forEach((address, caip2) => {
        bip122Wallets[address] = wallet2
        bip122AllAddresses.push(address)
    })
    bip122Addresses = [addresses1, addresses2]
    return {
        bip122Wallets,
        bip122Addresses
    }
}