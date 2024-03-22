import { BIP122_METHODS } from '@/data/Bip122Data'
import { getWalletAddressFromParams } from '@/utils/HelperUtil'
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils'
import { SignClientTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
import { bip122Wallets, bip122AllAddresses } from '@/utils/Bip122WalletUtil'

export async function approveBip122Request(
  requestEvent: SignClientTypes.EventArguments['session_request']
// ...

) {
    const { params, id } = requestEvent
    const { request } = params
    // Retrieve the wallet from params
    const wallet = bip122Wallets[getWalletAddressFromParams(bip122AllAddresses, params)] //solanaWallets[getWalletAddressFromParams(solanaAddresses, params)]
    console.log("PARAMS", params)
    switch (request.method) {
        case BIP122_METHODS.BIP122_SIGN_MESSAGE:
                const signedMessage = await wallet.signMessage(request.params.address, request.params.message)
                // Format it in HEX
                const signedMessageHex = Buffer.from(signedMessage).toString('hex')
                return formatJsonRpcResult(id, signedMessageHex)
        default:
            throw new Error(getSdkError('INVALID_METHOD').message)
    }
}

export function rejectBip122Request(request: SignClientTypes.EventArguments['session_request']) {
  const { id } = request

  return formatJsonRpcError(id, getSdkError('USER_REJECTED_METHODS').message)
}
