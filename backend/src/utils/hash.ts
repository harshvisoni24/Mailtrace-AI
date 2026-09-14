import crypto from "crypto";

export function sha256(data: string | Buffer): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Development Evidence Integrity Ledger.
 *
 * This is a cryptographic hash-chain, NOT a decentralized blockchain.
 * Each entry commits to (previousHash + evidenceHash + action + timestamp),
 * so any retroactive edit breaks the chain and is detectable. The schema
 * (EvidenceLedgerEntry) is intentionally structured so it could later be
 * anchored to a real distributed ledger without changing the data model.
 */
export function computeLedgerEntryHash(params: {
  previousHash: string | null;
  evidenceHash: string;
  action: string;
  timestamp: string;
}): string {
  const payload = `${params.previousHash ?? "GENESIS"}|${params.evidenceHash}|${params.action}|${params.timestamp}`;
  return sha256(payload);
}
