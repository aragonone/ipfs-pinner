import HttpStatus from 'http-status-codes'
import request from 'supertest'

const serverPort = process.env.SERVER_PORT || 8000
const serverURL = `http://localhost:${serverPort}`
const TEST_ADDR = '0x7410937813608C0C9f968C17A44A2bAA336C89c2'
const TEST_FILE_ADDR = '0x7410937813608C0C9f968C17A44A2bAA336C89c2'
const TEST_FILE_META = {
  sizeBytes: 5712538,
  extension: "pdf",    
  encoding: "UTF-8",
  createdAt: 1590322097,
  owner: "0x...",
  verified: false,
  transactionHash: "0x...",
  cid: "Qm..."
}

describe('File creation', () => {
  test('should create a file', async () => {
    const res = await request(serverURL).post('/files').send({
      owner: TEST_ADDR,
      file: 'test'
    })
    expect(res.status).toEqual(HttpStatus.OK)
    expect(res.body).toEqual(TEST_FILE_META)
  })
  
  test('should delete a file', async () => {
    const res = await request(serverURL).post(`/files/${TEST_FILE_ADDR}:delete`).send({
      signature: 'test'
    })
    expect(res.status).toEqual(HttpStatus.OK)
    expect(res.body).toEqual({
      deleted: true
    })
  })
  
  test('should get single file', async () => {
    const res = await request(serverURL).get(`/files/${TEST_FILE_ADDR}`).send()
    expect(res.status).toEqual(HttpStatus.OK)
    expect(res.body).toEqual(TEST_FILE_META)
  })
  
  test('should get list of files', async () => {
    const res = await request(serverURL).get(`/files`).send()
    expect(res.status).toEqual(HttpStatus.OK)
    expect(res.body).toEqual({
      total: 100,
      results: [TEST_FILE_META]
    })
  })
})
