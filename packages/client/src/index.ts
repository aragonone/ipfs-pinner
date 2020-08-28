import request from 'superagent'
import urljoin from 'url-join'

const DEFAULT_ENDPOINT = 'https://ipfs-pinner.backend.aragon.org'

type pinContent = Buffer | File | Blob
interface fileMeta {
  owner: string,
  cid: string,
  verified: boolean,
  sizeBytes: number,
  originalName: string | null,
  encoding: string | null,
  mimeType: string | null,
  expiresAt: string | null,
  transactionHash: string | null,
  lastScannedBlock: number
}
interface fileMetaPage {
  total: number
  results: fileMeta[]
}
interface deleteStatus {
  deleted: boolean
}
type pinnerErrors = Array<{
  [type: string]: string
}>
class PinnerError extends Error {
  errors: pinnerErrors
  constructor(pinnerErrors: pinnerErrors) {
    super('IPFS pinner encountered an error')
    this.errors = pinnerErrors
    this.name = 'PinnerError'
  }
}

class Client {
  private endpoint!: string

  constructor(endpoint: string) {
    this.setEndpoint(endpoint)
  }

  setEndpoint(endpoint: string) {
    this.endpoint = endpoint
  }

  async upload(ethAddress: string, content: pinContent, fileName: string): Promise<fileMeta> {
    try {
      const res = await this.post('/files')
        .field('owner', ethAddress)
        .attach('file', content, fileName)
      return res.body as fileMeta
    }
    catch (error) {
      throw this.getError(error)
    }
  }

  async findOne(cid: string): Promise<fileMeta> {
    try {
      const res = await this.get(`/files/${cid}`)
      return res.body as fileMeta
    }
    catch (error) {
      throw this.getError(error)
    }
  }

  async findAll(owner?: string, page = 0, pageSize = 10): Promise<fileMetaPage> {
    try {
      let req = this.get(`/files`).query({page, pageSize})
      if (owner) {
        req = req.query({owner})
      }
      const res = await req
      return res.body as fileMetaPage
    }
    catch (error) {
      throw this.getError(error)
    }
  }

  async delete(cid: string, signature: string, timestamp: number): Promise<deleteStatus> {
    try {
      const res = await this.post(`/files/${cid}:delete`)
        .send({ signature, timestamp })
      return res.body as deleteStatus
    }
    catch (error) {
      throw this.getError(error)
    }
  }

  private get(path = '/') {
    return request.get(urljoin(this.endpoint, path))
  }
  private post(path = '/') {
    return request.post(urljoin(this.endpoint, path))
  }
  private getError(error: any) {
    if (error.response?.body?.errors) {
      return new PinnerError(error.response.body.errors as pinnerErrors)
    }
    else if (error.code == 'ENOTFOUND' || error.code == 'ECONNREFUSED') {
      return new PinnerError([{ endpoint: `Could not connect to endpoint (${error.message})` }])
    }
    else {
      return error
    }
  }
}

const client = new Client(DEFAULT_ENDPOINT)

export default client
export {
  client,
  fileMeta,
  PinnerError
}
