# IPFS Pinner - Server

This package exposes the REST API.

## REST API

### 1. Upload content

**Request:**

- Method: `POST`
- Path: `/files`
- Content-Type: `multipart/form-data`
- Body:

```
file: <content>
-------------------
owner: "0x..."
```

**Successful response:**

- *same as GET metadata (see below)*

**Error response:** bad request

- Code: `400 Bad Request`
- Body:

```
{
  "errors": [
    { "file": "File is already uploaded with cid <CID>" }
    ...
    { "file": "File content must be given" }
    ...
    { "owner": "Owner address must be given" }
    ...
    { "owner": "Given owner address is not valid" }
  ]
}
```

### 2. Delete pin and metadata

**Request:**

- Method: `POST`
- Path: `/files/<cid>:delete`
- Content-Type: `application/json`
- Body:

```json
{
  "signature": "0x....",
  "timestamp": 123456
}
```

**Successful response:**

- Code: `200 OK`
- Body:

```json
{
  "deleted": true
}
```

**Error response:** Signature / timestamp errors

- Code: `400 Bad Request`
- Body:

```
{
  "errors": [
    { "timestamp": "A timestamp must be given" }
    ...
    { "timestamp": "Given timestamp is not valid" }
    ...
    { "timestamp": "Given timestamp is obsolete" }
    ...
    { "signature": "A signature must be given" }
    ...
    { "signature": "Given signature is not valid" }
    ...
    { "signature": "Signature address and owner address do not match" }
  ]
}
```

**Error response:** not found

- Code: `404 Not Found`
- Body:

```json
{
  "errors": [
    { "file": "Not found" }
  ]
}
```

### 3. Get files

**Request:**

- Method: `GET`
- Path: `/files`
- Query params:
    - `owner=<address>`
    - `page=<num>`
    - `pageSize=<num>`

**Successful response:**

- Code: `200 OK`
- Body:

```
{
  "total": 100,
  "results": [see GET metadata below]
}
```

### 4. Get metadata

**Request:**

- Method: `GET`
- Path: `/files/<cid>`

**Successful response:**

- Code: `200 OK`
- Body:

```
{
  owner: "0x...",
  cid: "Qm...",
  verified: true || false,
  sizeBytes: 11,
  originalName: "file.txt",
  encoding: "7bit",
  mimeType: "text/plain",
  transactionHash: "0x..." || null,
  createdAt: "2020-08-27T22:51:57.005Z",
}
```

**Error response:** not found

- Code: `404 Not Found`
- Body:

```json
{
  "errors": [
    { "file": "Not found" }
  ]
}
```