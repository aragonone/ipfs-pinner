# Client

This is a client library for integrating into other projects.

## Installation

```bash
yarn add @aragonone/ipfs-pinner-client
```

## Usage
```ts
import client from '@aragonone/ipfs-pinner-client'

// upload and get file metadata
fileMeta = await client.upload(ethAddress, content, fileName)

// get single file
fileMeta = await client.findOne(cid)

// get multiple files
fileMetaPage = await client.findAll(owner, page, pageSize)

// delete IPFS pin and metadata
deleteStatus = await client.delete(cid, signature, timestamp)
```

For type information see [./src/index.ts](./src/index.ts)

For usage in server integration tests see: [../server/test/integration/file-creation.test.ts](../server/test/integration/file-creation.test.ts)

## Error handling
```ts
import { client, PinnerError } from '@aragonone/ipfs-pinner-client'
try {
  fileMeta = await client.upload(ethAddress, content, fileName)
}
catch (err) {
  if (err instanceof PinnerError) {
    pinnerErrors = err.errors
  }
}
```

If server is unreachable:
```ts
pinnerErrors = [{ endpoint: `Could not connect to endpoint (<MESSAGE>)` }]
```

Server error responses are documented in [../server](../server)
