import { SignJWT, jwtVerify, CompactEncrypt, compactDecrypt } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-256-bit-secret-key-base64-minimum-32-chars';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function signSession(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(encodedSecret);
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload;
  } catch (error) {
    return null;
  }
}

// Helper to derive a 32-byte key from JWT_SECRET for AES-256-GCM
async function getEncryptionKey() {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const hash = await crypto.subtle.digest('SHA-256', secret);
    return new Uint8Array(hash);
}

export async function encryptConfig(config: any) {
    const key = await getEncryptionKey();
    const jwe = await new CompactEncrypt(
        new TextEncoder().encode(JSON.stringify(config))
    )
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .encrypt(key);
    return jwe;
}

export async function decryptConfig(jwe: string) {
    try {
        const key = await getEncryptionKey();
        const { plaintext } = await compactDecrypt(jwe, key);
        return JSON.parse(new TextDecoder().decode(plaintext));
    } catch (e) {
        return null;
    }
}
