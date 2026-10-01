import { secp256k1 } from '@noble/curves/secp256k1';
import { bytesToHex, concatHex, hexToBytes, keccak256, getAddress, type Address, type Hex } from 'viem';
import { isBytes32 } from './validation.js';

export function randomBytes32(): Hex {
  const value = new Uint8Array(32);
  globalThis.crypto.getRandomValues(value);
  return bytesToHex(value);
}

export function ptlcPoint(secret: Hex): Hex {
  if (!isBytes32(secret)) throw new Error('PTLC secret must be 32 bytes');
  return keccak256(secret);
}

export function balanceCommitment(balance: bigint, blinding: Hex): Hex {
  if (balance < 0n || balance > (1n << 64n) - 1n || !isBytes32(blinding)) throw new Error('Invalid commitment input');
  const balanceHex = `0x${balance.toString(16).padStart(16, '0')}` as Hex;
  return keccak256(concatHex([balanceHex, blinding]));
}

/** secp256k1 ECDH stealth derivation; R and the view tag are included for merchant scanning. */
export function createStealthAddress(scanPublicKey: Hex, spendPublicKey: Hex): { address: Address; ephemeralPubkey: Hex; viewTag: number } {
  const scan = secp256k1.ProjectivePoint.fromHex(scanPublicKey.slice(2));
  const spend = secp256k1.ProjectivePoint.fromHex(spendPublicKey.slice(2));
  if (scan.equals(secp256k1.ProjectivePoint.ZERO) || spend.equals(secp256k1.ProjectivePoint.ZERO)) throw new Error('Invalid merchant public key');
  const secret = secp256k1.utils.randomPrivateKey();
  const ephemeralPubkey = bytesToHex(secp256k1.getPublicKey(secret, true));
  const shared = secp256k1.getSharedSecret(secret, hexToBytes(scanPublicKey), true);
  const hash = keccak256(bytesToHex(shared));
  const tweak = BigInt(hash) % secp256k1.CURVE.n;
  if (tweak === 0n) throw new Error('Invalid stealth tweak');
  const derived = spend.add(secp256k1.ProjectivePoint.BASE.multiply(tweak));
  const uncompressed = bytesToHex(derived.toRawBytes(false));
  const address = getAddress(`0x${keccak256(`0x${uncompressed.slice(4)}`).slice(-40)}`);
  return { address, ephemeralPubkey, viewTag: Number.parseInt(hash.slice(2, 4), 16) };
}
