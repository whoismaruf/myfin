import crypto from 'crypto';

/**
 * Derives a 32-byte key from environment variables.
 * Uses ENCRYPTION_KEY if provided; falls back to SHA-256 of NEXTAUTH_SECRET.
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || 'myfin-fallback-secret-key-32bytes!';
  // Normalize key to exactly 32 bytes using SHA-256
  return crypto.createHash('sha256').update(envKey).digest();
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Formats result as: enc:<iv-hex>:<authTag-hex>:<ciphertext-hex>
 */
export function encrypt(text: string | null | undefined): string | null {
  if (!text) return text ?? null;

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(12); // 12 bytes recommended for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `enc:${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('Field encryption failed:', error);
    return text;
  }
}

/**
 * Decrypts an AES-256-GCM encrypted payload.
 * If text is not prefixed with 'enc:', it returns the original string (safe migration).
 */
export function decrypt(text: string | null | undefined): string | null {
  if (!text) return text ?? null;
  if (!text.startsWith('enc:')) return text;

  try {
    const parts = text.split(':');
    if (parts.length !== 4) return text;

    const [, ivHex, authTagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Field decryption failed or integrity check failed:', error);
    return text;
  }
}
