# IPFS Background Service - Worker

Background worker for veryfing and cleaning uploaded files.

Worker scan is run every 10 minutes.

Scanner looks for hex-encoded IPFS CID in transaction data originating from the file owner's address.

File is deleted from IPFS and local database if it has not been verified for 24 hours.
