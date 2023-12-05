import { metadata as coreMetadata } from '@hop-protocol/core/metadata'
import { TokenSymbol, Slug } from '@hop-protocol/sdk'
import { reactAppNetwork, isMainnet } from 'src/config'
import { capitalize } from 'src/utils/capitalize'

type Metadata = {
  tokens: {
    [key in TokenSymbol | string]: {
      symbol: string
      name: string
      decimals: number
      image: any
      nativeTokenSymbol: string
    }
  }
  networks: {
    [key in Slug | string]: {
      name: string
      isLayer1: boolean
      image: any
      nativeTokenSymbol: string
    }
  }
}

const { tokens, chains } = coreMetadata[reactAppNetwork]

const chainMetadata : any = {}

for (const chainSlug in chains) {
  const chainObj = chains[chainSlug]
  let name = chainObj.name
  if (!isMainnet && chainSlug === Slug.ethereum) {
    name = `${chainObj.name} ${capitalize(reactAppNetwork)}`
  }
  chainMetadata[chainSlug] = {
      name: chainObj.name,
      isLayer1: chainObj.isLayer1,
      image: chainObj.image,
      nativeTokenSymbol: chainObj.nativeTokenSymbol,
  }
}

export const metadata: Metadata = {
  tokens,
  networks: chainMetadata
}
