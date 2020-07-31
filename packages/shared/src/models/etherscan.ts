import axios, { AxiosRequestConfig } from 'axios'
import { toHex, hexToNumber } from 'web3-utils'

type ethNetwork = 'mainnet' | 'rinkeby' | 'ropsten'
const { ETHERSCAN_API_KEY, ETHERSCAN_NETWORK } = process.env
interface transaction {
  blockNumber: string,
  hash: string,
  input: string,
}

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
    const transactions = await this.getTransactionsFrom(address, startblock)
    const cidHex = toHex(cid).replace('0x', '')
    const { hash } = transactions.find(({ input }) => input.includes(cidHex)) || { hash: null }
    const lastScannedBlock = Number(transactions[transactions.length-1]?.blockNumber) || null
    return { 
      transactionHash: hash, 
      lastScannedBlock
    }
  }
  
  async getTransactionsFrom(address: string, startblock: number): Promise<transaction[]> {
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
  
  async getBlockNumber(): Promise<number> {
    const data = await this.get({
      module: 'proxy',
      action: 'eth_blockNumber',
    })
    if (!data.jsonrpc || !data.result) {
      throw this.error(data)
    }
    return hexToNumber(data.result)
  }

  private async get(params: AxiosRequestConfig['params']): Promise<any> {
    params.apikey = this.apiKey
    const { data } = await axios.get(this.apiUrl, { params })
    return data
  }

  private error(data: any): Error {
    return Error(`Received error from Etherscan: ${JSON.stringify(data)}`)
  }
}

export default new Etherscan(ETHERSCAN_API_KEY as string, ETHERSCAN_NETWORK as ethNetwork)
