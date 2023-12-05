import { BigNumber, FixedNumber, utils } from 'ethers'
import Network from 'src/models/Network'
import { commafy, prettifyErrorMessage, toTokenDisplay } from '.'

type PossibleError = {
  data?: {
    message?: string
  }
  message?: string
}

export function formatError(error: unknown, network?: Network): string {
  let errMsg = 'Something went wrong. Please try again.'

  if (typeof error !== 'string') {
    if (Array.isArray(error) && error.length === 1) {
      return formatError(error[0], network)
    }

    if (error == null) {
      return ''
    }

    const errObj = error as PossibleError

    if (!(error instanceof Object)) {
      return errMsg
    }

    if (errObj.data?.message) {
      errMsg = errObj.data.message
    } else if (errObj.message) {
      errMsg = errObj.message
    }
  } else {
    errMsg = error
  }

  const rpcEndpointsDocs = 'https://docs.hop.exchange/v/developer-docs/rpc/rpc-endpoints'

  // TODO: handle custom error messages elsewhere (and better)
  if (
    errMsg.includes('not enough funds for gas') ||
    errMsg.includes('insufficient funds') ||
    errMsg.includes('Insufficient funds')
  ) {
    const feeToken = network?.nativeTokenSymbol || 'funds'
    errMsg = `Insufficient balance. Please add ${feeToken} to pay for tx fees. Error: ${errMsg}`
  } else if (errMsg.includes('NetworkError when attempting to fetch resource')) {
    errMsg = `${errMsg} Please check your wallet network settings are correct and try again. More info: ${rpcEndpointsDocs}`
  } else if (
    errMsg.includes('[ethjs-query]') ||
    errMsg.includes('while formatting outputs from RPC')
  ) {
    errMsg = `An RPC error occurred. Please check your wallet network settings are correct and refresh page to try again. More info: ${rpcEndpointsDocs}. Error: ${errMsg}`
  } else if (
    errMsg.includes('Failed to fetch') ||
    errMsg.includes('could not detect network') ||
    errMsg.includes('Not Found') ||
    errMsg.includes('Non-200 status code')
  ) {
    errMsg = `There was a network error. Please disable any ad blockers and check your wallet network settings are correct and refresh page to try again. More info: ${rpcEndpointsDocs}. Error: ${errMsg}`
  } else if (errMsg.includes('unsupported block number') || errMsg.includes('rlp: expected List') || errMsg.includes('PermissionDenied, permission denied for tx type: Call')) {
    errMsg = `An RPC error occurred. Please refresh page to try again. Error: ${errMsg}`
  } else if (errMsg.includes('transaction underpriced')) {
    errMsg = `An RPC error occurred. The transaction is underpriced. Please try again and increase gas price. If you are seeing is error a lot, try resetting the nonce for your wallet account. Error: ${errMsg}`
  } else if (errMsg.includes('header not found') || errMsg.includes('intrinsic gas too low')) {
    errMsg = `An RPC error occurred. Please check your wallet network settings are correct and try again. Consider using a different RPC provider if you are seeing this error frequently. More info: ${rpcEndpointsDocs}. Error: ${errMsg}`
  } else if (errMsg.includes('sequencer transaction forwarding not configured') || errMsg.includes('rate limit') || errMsg.includes('compute units') || errMsg.includes('Optimism sequencer global transaction limit exceeded') || errMsg.includes('request timed out')) {
    errMsg = `An RPC error occurred. Please try again. Consider using a different RPC provider if you are seeing this error often. More info: ${rpcEndpointsDocs}. Error: ${errMsg}`
  } else if (errMsg.includes('already minted')) {
    errMsg = 'Account has already minted tokens. Only one mint per account is allowed.'
  } else if (errMsg.includes('user rejected transaction') || errMsg.includes('ACTION_REJECTED')) {
    errMsg = 'Cancelled'
  } else if (errMsg.includes('Cannot transfer staked or escrowed SNX')) {
    errMsg = `Cannot transfer staked or escrowed SNX. Error: ${errMsg}`
  } else if (errMsg.includes('Internal JSON-RPC error') || errMsg.includes('Internal error')) {
    const feeToken = network?.nativeTokenSymbol || 'funds'
    errMsg = `An RPC error occurred. Please check you have enough ${feeToken} to pay for fees and check your wallet network settings are correct. Refresh to try again. More info: ${rpcEndpointsDocs}. Error: ${errMsg}`
  } else if (errMsg.includes('call revert exception') || errMsg.includes('missing revert data')) {
    errMsg = `An RPC error occurred. Please check your wallet network settings are correct and refresh page to try again. More info: ${rpcEndpointsDocs}. Error: ${errMsg}`
  } else if (errMsg.includes('no matching key')) { // https://github.com/WalletConnect/walletconnect-monorepo/issues/1772
    errMsg = `A WalletConnect error occurred. This may be an issue with the Wallet you are using. Error: ${errMsg}`
  }

  return prettifyErrorMessage(errMsg)
}

export function sanitizeNumericalString(numStr: string) {
  return numStr.replace(/[^0-9.]|\.(?=.*\.)/g, '')
}

export function maxDecimals(amount: string, decimals: number) {
  const sanitizedAmount = sanitizeNumericalString(amount)
  const indexOfDecimal = sanitizedAmount.indexOf('.')
  if (indexOfDecimal === -1) {
    return sanitizedAmount
  }

  const wholeAmountStr = sanitizedAmount.slice(0, indexOfDecimal) || '0'
  const wholeAmount = BigNumber.from(wholeAmountStr).toString()

  const fractionalAmount = sanitizedAmount.slice(indexOfDecimal + 1)
  const decimalAmount = decimals !== 0 ? `.${fractionalAmount.slice(0, decimals)}` : ''

  return `${wholeAmount}${decimalAmount}`
}

export function fixedDecimals(amount: string, decimals: number = 18) {
  if (amount === '') {
    return amount
  }
  const mdAmount = maxDecimals(amount, decimals)
  return FixedNumber.from(mdAmount).toString()
}

export function amountToBN(amount: string | number, decimals: number = 18) {
  const fixedAmount = fixedDecimals(amount.toString(), decimals)
  return utils.parseUnits(fixedAmount || '0', decimals)
}

export function truncateHash(hash) {
  return `${hash.substring(0, 6)}…${hash.substring(62, 66)}`
}

export function formatTokenString(value: BigNumber, tokenDecimals = 18, trailingDecimals = 2) {
  if (value == null || tokenDecimals == null) {
    return ''
  }
  if (tokenDecimals <= 1) {
    return value.toString()
  }
  return fixedDecimals(toTokenDisplay(value, tokenDecimals), trailingDecimals)
}

export function formatTokenDecimalString(value: any, tokenDecimals = 18, trailingDecimals = 2) {
  return commafy(formatTokenString(value, tokenDecimals, trailingDecimals))
}
