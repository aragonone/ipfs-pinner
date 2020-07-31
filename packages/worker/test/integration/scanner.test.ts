import { FileMeta, ipfs, etherscan } from '@aragonone/ipfs-background-service-shared'
import scan from '../../src/helpers/scanner'
import { toHex } from 'web3-utils'

const TEST_OWNER_ADDR = '0x7410937813608C0C9f968C17A44A2bAA336C89c2'
const TEST_FILE_NAME = 'test.txt'
const TEST_FILE_CONTENT = Buffer.from('testcontent')
const TEST_FILE_CID = 'QmX4bqZRY5p1sjNDMARQqcEho5SUX2CssoZYs6e3UijEEQ'
const TEST_FILE_META = {
  owner: TEST_OWNER_ADDR.toLowerCase(),
  cid: TEST_FILE_CID,
  verified: false,
  sizeBytes: 11,
  originalName: TEST_FILE_NAME,
  encoding: '7bit',
  mimeType: 'text/plain',
}

describe('Scanner functionality', () => {

  // blockchain mocks
  beforeAll(() => {
    etherscan.getBlockNumber = () => Promise.resolve(10500000)
    etherscan.getTransactionsFrom = () => Promise.resolve([])
  })

  // cleanup
  afterAll(async () => {
    await ipfs.gc()
    await FileMeta.knex().destroy()
  })
  afterEach(async () => {
    await ipfs.del(TEST_FILE_CID)
    await FileMeta.del({cid: TEST_FILE_CID})
  })
  
  describe('Unexpired file', () => {
    beforeAll(async () => {
      await ipfs.add(TEST_FILE_CONTENT)
      await FileMeta.create(TEST_FILE_META)
    })
    test('Should not delete unexpired file', async () => {
      await scan()
      expect(await FileMeta.exists({cid: TEST_FILE_CID})).toEqual(true)
      expect(await ipfs.exists(TEST_FILE_CID)).toEqual(true)
    })
  })
  
  describe('Expired file', () => {
    beforeAll(async() => {
      await ipfs.add(TEST_FILE_CONTENT)
      await FileMeta.create({
        ... TEST_FILE_META,
        expiresAt: new Date(Date.now()-1)
      })
    })
    test('Should delete expired file', async () => {
      await scan()
      expect(await FileMeta.exists({cid: TEST_FILE_CID})).toEqual(false)
      expect(await ipfs.exists(TEST_FILE_CID)).toEqual(false)
    })
  })
  
  describe('Verification missing cid', () => {
    beforeAll(async() => {
      await ipfs.add(TEST_FILE_CONTENT)
      await FileMeta.create(TEST_FILE_META)
      etherscan.getTransactionsFrom = () => Promise.resolve([
        {
          hash: 'testhash', 
          blockNumber: '10500000', 
          input: 'testcontent'
        }
      ])
    })
    test('Should not verify file with missing cid', async () => {
      await scan()
      const file = await FileMeta.findOne({cid: TEST_FILE_CID})
      expect(file.verified).toEqual(false)
    })
  })

  describe('Verification existing cid', () => {
    beforeAll(async() => {
      await ipfs.add(TEST_FILE_CONTENT)
      await FileMeta.create(TEST_FILE_META)
      etherscan.getTransactionsFrom = () => Promise.resolve([
        {
          hash: 'testhash', 
          blockNumber: '10500000', 
          input: `testcontent${toHex(TEST_FILE_CID)}testcontent`,
        }
      ])
    })
    test('Should verify file with existing cid', async () => {
      await scan()
      const file = await FileMeta.findOne({cid: TEST_FILE_CID})
      expect(file.verified).toEqual(true)
      expect(file.transactionHash).toEqual('testhash')
    })
  })
})
