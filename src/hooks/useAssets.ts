import { CanonicalToken, HopBridge } from '@hop-protocol/sdk'
import { useMemo } from 'react'
import logger from 'src/logger'
import Network from 'src/models/Network'

export function useAssets(selectedBridge?: HopBridge, network?: Network, toNetwork?: Network) {
  // Check if asset is supported by networks
  const unsupportedAsset = useMemo<any>(() => {
    if (!selectedBridge) {
      return null
    }

    const tokenSymbol = selectedBridge?.getTokenSymbol()

    if (network) {
      if (!selectedBridge?.isSupportedAsset(network?.slug)) {
        return {
          chain: network?.slug,
          tokenSymbol
        }
      }
    }

    if (toNetwork) {
      if (!selectedBridge?.isSupportedAsset(toNetwork?.slug)) {
        return {
          chain: toNetwork?.slug,
          tokenSymbol
        }
      }
    }

    return null
  }, [selectedBridge, network, toNetwork])

  // Check if asset uses an AMM
  const assetWithoutAmm = useMemo<any>(() => {
    if (!(selectedBridge && network)) {
      return null
    }
    const nonAmmAssets = selectedBridge.getNonAmmAssets()
    const tokenSymbol = selectedBridge?.getTokenSymbol()
    const isUnsupported = nonAmmAssets.has(tokenSymbol)
    if (isUnsupported) {
      return {
        chain: network?.slug,
        tokenSymbol
      }
    }

    return null
  }, [selectedBridge, network, toNetwork])

  // Set source token
  const sourceToken = useMemo(() => {
    try {
      if (!network || !selectedBridge || unsupportedAsset?.chain) return
      return selectedBridge.getCanonicalToken(network?.slug)
    } catch (err) {
      logger.error(err)
    }
  }, [unsupportedAsset, selectedBridge, network])

  // Set destination token
  const destToken = useMemo(() => {
    try {
      if (!toNetwork || !selectedBridge || unsupportedAsset?.chain) return
      return selectedBridge.getCanonicalToken(toNetwork?.slug)
    } catch (err) {
      logger.error(err)
    }
  }, [unsupportedAsset, selectedBridge, toNetwork, assetWithoutAmm])

  // Set placeholder token
  const placeholderToken = useMemo(() => {
    if (!selectedBridge) return
    return selectedBridge.getL1Token()
  }, [selectedBridge])

  return {
    unsupportedAsset,
    sourceToken,
    destToken,
    placeholderToken,
    assetWithoutAmm
  }
}
