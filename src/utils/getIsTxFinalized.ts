import { getProviderByNetworkName } from 'src/utils/getProvider'
import { getNetworkWaitConfirmations } from 'src/utils/networks'

export async function getIsTxFinalized (
  txBlockNumber: number | undefined,
  chainSlug: string
): Promise<boolean> {
  if (!txBlockNumber) return false

  const provider = getProviderByNetworkName(chainSlug)
  const latestBlock = await provider.getBlock('latest')
  const waitConfirmations = getNetworkWaitConfirmations(chainSlug)
  return waitConfirmations ? latestBlock.number - txBlockNumber > waitConfirmations : false
}
