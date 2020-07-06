import HttpStatus from 'http-status-codes'
import request from 'supertest'

const serverPort = process.env.SERVER_PORT || 8000
const serverURL = `http://localhost:${serverPort}`

describe('File creation', () => {
  test('should create a file', async () => {
    const res = await request(serverURL).post('/files').send({
      created: true
    })
    expect(res.status).toEqual(HttpStatus.OK)
    expect(res.body).toEqual({
      created: true
    })
  })
})
