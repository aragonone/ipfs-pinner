import HttpStatus from 'http-status-codes'
import request from 'supertest'
import { Server } from 'http'

import metricsReporter from '../../src/helpers/metrics-reporter'
import { FileMeta, ipfs, etherscan } from '@aragonone/ipfs-background-service-shared'

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
  })
  
  // delete endpoint to do later
  // test('should delete a file', async () => {
  //   const res = await request(serverURL).post(`/files/${TEST_FILE_CID}:delete`).send({
  //     signature: 'test'
  //   })
  //   expect(res.status).toEqual(HttpStatus.OK)
  //   expect(res.body).toEqual({
  //     deleted: true
  //   })
  // })
  
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
})
