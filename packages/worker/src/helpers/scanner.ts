import { File, ipfs } from '@aragonone/ipfs-background-service-shared'

export default async function scan() {
  const files = await File.findUnverified()
  for (const file of files) {
    const { cid } = file
    if (file.isExpired()) {
      await file.del()
      await ipfs.del(String(cid))
    }
    else {
      /*
      to-do: scan blockchain:
      - get lastScannedBlock from db
      - get owner transaction receipts since lastScannedBlock
      - get event data and look for cid
      - set verified = true, expiresAt = null if cid is found
      - update lastScannedBlock to current block
      */
    }
  }
}
