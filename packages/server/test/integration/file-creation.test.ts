import HttpStatus from 'http-status-codes'
import request from 'supertest'
import { Server } from 'http'
import { Wallet } from 'ethers'

import metricsReporter from '../../src/helpers/metrics-reporter'
import { FileMeta, ipfs, etherscan } from '@aragonone/ipfs-pinner-shared'

const TEST_OWNER_ADDR = '0x4e1326002e313a0245FC0a1C2fd8E0684C9a0C5A'
const TEST_PRIVATE_KEY = '0x407eeeb61674af71138c7013be2a995b0e3323093dce7a4f3e58cf5112db236f'
const wallet = new Wallet(TEST_PRIVATE_KEY)
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
  transactionHash: null,
  createdAt: expect.any(String),
}

describe('File creation', () => {

  // start the server
  let server: Server
  beforeAll(() => {
    etherscan.getBlockNumber = () => Promise.resolve(10500000)
    server = require('../../src/index').server
  })

  // cleanup
  afterAll(async () => {
    await FileMeta.del({cid: TEST_FILE_CID})
    await FileMeta.knex().destroy()
    await ipfs.del(TEST_FILE_CID)
    await ipfs.gc()
    server.close()
    metricsReporter.server.close()
  })

  test('should create a file', async () => {
    const res = await request(server)
      .post('/files')
      .field('owner', TEST_OWNER_ADDR)
      .attach('file', TEST_FILE_CONTENT, TEST_FILE_NAME)
    expect(res.status).toEqual(HttpStatus.OK)
    expect(res.body).toEqual(TEST_FILE_META)
    expect(await FileMeta.exists({cid: TEST_FILE_CID})).toEqual(true)
    expect(await ipfs.exists(TEST_FILE_CID)).toEqual(true)
  })
  
  test('should get single file', async () => {
    const res = await request(server).get(`/files/${TEST_FILE_CID}`).send()
    expect(res.status).toEqual(HttpStatus.OK)
    expect(res.body).toEqual(TEST_FILE_META)
  })
  
  test('should get list of files', async () => {
    const res = await request(server).get(`/files`).send()
    expect(res.status).toEqual(HttpStatus.OK)
    expect(res.body).toEqual({
      total: 1,
      results: [TEST_FILE_META]
    })
  })
  
  test('should fail to delete a file with bad signature', async () => {
    const timestamp = Date.now()
    const signature = 'test'
    const res = await request(server).post(`/files/${TEST_FILE_CID}:delete`).send({
      signature,
      timestamp
    })
    expect(res.status).toEqual(HttpStatus.BAD_REQUEST)
    expect(await FileMeta.exists({cid: TEST_FILE_CID})).toEqual(true)
    expect(await ipfs.exists(TEST_FILE_CID)).toEqual(true)
  })
  
  test('should delete a file with correct signature', async () => {
    const timestamp = Date.now()
    const signature = await wallet.signMessage(timestamp.toString())
    const res = await request(server).post(`/files/${TEST_FILE_CID}:delete`).send({
      signature,
      timestamp
    })
    expect(res.status).toEqual(HttpStatus.OK)
    expect(res.body).toEqual({
      deleted: true
    })
    expect(await FileMeta.exists({cid: TEST_FILE_CID})).toEqual(false)
    expect(await ipfs.exists(TEST_FILE_CID)).toEqual(false)
  })
})
