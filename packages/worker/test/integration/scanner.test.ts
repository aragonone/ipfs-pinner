import { File, ipfs } from '@aragonone/ipfs-background-service-shared'
import scan from '../../src/helpers/scanner'

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

  // cleanup
  afterAll(async () => {
    await ipfs.gc()
    await File.knex().destroy()
  })
  afterEach(async () => {
    await ipfs.del(TEST_FILE_CID)
    await File.del({cid: TEST_FILE_CID})
  })
  
  describe('Unexpired file', () => {
    beforeAll(async () => {
      await ipfs.add(TEST_FILE_CONTENT)
      await File.create(TEST_FILE_META)
    })
    test('Should not delete unexpired file', async () => {
      await scan()
      expect(await File.exists({cid: TEST_FILE_CID})).toEqual(true)
      expect(await ipfs.exists(TEST_FILE_CID)).toEqual(true)
    })
  })
  
  describe('Expired file', () => {
    beforeAll(async() => {
      await ipfs.add(TEST_FILE_CONTENT)
      await File.create({
        ... TEST_FILE_META,
        expiresAt: new Date(Date.now()-1)
      })
    })
    test('Should delete expired file', async () => {
      await scan()
      expect(await File.exists({cid: TEST_FILE_CID})).toEqual(false)
      expect(await ipfs.exists(TEST_FILE_CID)).toEqual(false)
    })
  })

  // to-do: test file verification
})
