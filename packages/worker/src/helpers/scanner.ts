import { FileMeta, ipfs, etherscan } from '@aragonone/ipfs-pinner-shared'
import metrics from './metrics-reporter'

export default async function scan() {
  const files = await FileMeta.findUnverified()
  for (const file of files) {
    const { cid, owner } = file
    if (file.isExpired()) {
      await file.del()
      await ipfs.del(cid!)
      metrics.fileExpired()
      console.log(`Expired file ${cid} deleted`)
    }
    else {
      console.log(`Scanning owner address ${owner} for file ${cid}`)
      await tryVerifyCid(file)
      metrics.fileScanned()
    }
  }
}

async function tryVerifyCid(file: FileMeta) {
  const { cid, owner } = file
  const startblock = file.lastScannedBlock! + 1
  const { transactionHash, lastScannedBlock } = await etherscan.findIpfsCid(cid!, owner!, startblock!)
  if (!lastScannedBlock) {
    return
  }
  let updateArgs: any = {
    lastScannedBlock
  }
  if (transactionHash) {
    updateArgs = {
      ... updateArgs,
      transactionHash,
      verified: true,
      expiresAt: null
    }
  }
  await FileMeta.update(updateArgs)
  if (transactionHash) {
    metrics.fileVerified()
    console.log(`File ${cid} verified with transaction ${transactionHash}`)
  }
}
