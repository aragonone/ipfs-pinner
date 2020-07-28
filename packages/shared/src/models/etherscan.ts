import axios, { AxiosRequestConfig } from 'axios'
import { toHex, hexToNumber } from 'web3-utils'

type ethNetwork = 'mainnet' | 'rinkeby' | 'ropsten'
const { ETHERSCAN_API_KEY, ETHERSCAN_NETWORK } = process.env

class Etherscan {

  private apiKey!: string
  private apiUrl!: string

  constructor(apiKey: string, network: ethNetwork = 'mainnet') {
    this.setApi(apiKey, network)
  }
  
  setApi(apiKey: string, network: ethNetwork = 'mainnet') {
    this.apiKey = apiKey
    let subdomain = 'api'
    if (network == 'rinkeby' || network == 'ropsten') {
      subdomain += `-${network}`
    }
    this.apiUrl = `https://${subdomain}.etherscan.io/api`
  }
  
  async findIpfsCid(cid: string, address: string, startblock: number) {
    let transactionHash: string | null = null
    let lastScannedBlock: number | null = null
    const transactions = await this.getTransactionsFrom(address, startblock)
    const cidHex = toHex(cid).replace('0x', '')
    for (const { hash, blockNumber, input } of transactions) {
      lastScannedBlock = blockNumber
      if (input.includes(cidHex)) {
        transactionHash = hash
        break
      }
    }
    return {
      transactionHash,
      lastScannedBlock
    }
  }
  
  async getTransactionsFrom(address: string, startblock: number) {
    const data = await this.get({
      module: 'account',
      action: 'txlist',
      sort: 'asc',
      address,
      startblock
    })
    if ((data.status !== '1' && data.message !== 'No transactions found') || !data.result) {
      throw this.error(data)
    }
    return data.result
  }
  
  async getBlockNumber() {
    const data = await this.get({
      module: 'proxy',
      action: 'eth_blockNumber',
    })
    if (!data.jsonrpc || !data.result) {
      throw this.error(data)
    }
    return hexToNumber(data.result)
  }

  private async get(params: AxiosRequestConfig['params']) {
    params.apikey = this.apiKey
    const { data } = await axios.get(this.apiUrl, { params })
    return data
  }

  private error(data: any) {
    return Error(`Received error from Etherscan: ${JSON.stringify(data)}`)
  }
}

export default new Etherscan(ETHERSCAN_API_KEY as string, ETHERSCAN_NETWORK as ethNetwork)
