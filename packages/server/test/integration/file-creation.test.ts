import HttpStatus from 'http-status-codes'
import request from 'supertest'
import ipfsClient from 'ipfs-http-client'

import { ObjectionModels } from '@aragonone/ipfs-background-service-shared'

const { File } = ObjectionModels
const serverPort = process.env.SERVER_PORT || 8000
const serverURL = `http://localhost:${serverPort}`
const ipfs = ipfsClient(process.env.IPFS_API_URL)
const TEST_OWNER_ADDR = '0x7410937813608C0C9f968C17A44A2bAA336C89c2'
const TEST_FILE_NAME = 'test.txt'
const TEST_FILE_CONTENT = Buffer.from('testcontent')
const TEST_FILE_CID = 'QmX4bqZRY5p1sjNDMARQqcEho5SUX2CssoZYs6e3UijEEQ'
const TEST_FILE_META = {
  owner: TEST_OWNER_ADDR.toLocaleLowerCase(),
  cid: TEST_FILE_CID,
  verified: false,
  sizeBytes: 11,
  originalName: TEST_FILE_NAME,
  encoding: '7bit',
  mimeType: 'text/plain',
  createdAt: expect.any(String),
}

describe('File creation', () => {

  // cleanup
  afterAll(async() => {
    await File.query().where({cid: TEST_FILE_CID}).del()
    await File.knex().destroy()
    await ipfs.pin.rm(TEST_FILE_CID)
    for await (const _ of ipfs.repo.gc()) { }
  })

  test('should create a file', async () => {
    const res = await request(serverURL)
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
    const res = await request(serverURL).get(`/files/${TEST_FILE_CID}`).send()
    expect(res.status).toEqual(HttpStatus.OK)
    expect(res.body).toEqual(TEST_FILE_META)
  })
  
  test('should get list of files', async () => {
    const res = await request(serverURL).get(`/files`).send()
    expect(res.status).toEqual(HttpStatus.OK)
    expect(res.body).toEqual({
      total: 1,
      results: [TEST_FILE_META]
    })
  })
})
