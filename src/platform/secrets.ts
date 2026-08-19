import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from 'crypto'

const tokenByteLength = 32
const ivByteLength = 12
const authTagByteLength = 16

const getEncryptionKey = () => {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) throw new Error('PAYLOAD_SECRET is required for secret encryption')
  return createHash('sha256').update(secret).digest()
}

export const createSecretValue = (prefix: string) => {
  return `${prefix}_${randomBytes(tokenByteLength).toString('base64url')}`
}

export const hashSecret = (secret: string) => {
  return createHash('sha256').update(secret).digest('hex')
}

export const getSecretPrefix = (secret: string) => {
  return secret.slice(0, Math.min(secret.length, 14))
}

export const encryptSecret = (secret: string) => {
  const iv = randomBytes(ivByteLength)
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return Buffer.concat([iv, authTag, encrypted]).toString('base64url')
}

export const decryptSecret = (encryptedSecret: string) => {
  const value = Buffer.from(encryptedSecret, 'base64url')
  const iv = value.subarray(0, ivByteLength)
  const authTag = value.subarray(ivByteLength, ivByteLength + authTagByteLength)
  const encrypted = value.subarray(ivByteLength + authTagByteLength)
  const decipher = createDecipheriv('aes-256-gcm', getEncryptionKey(), iv)
  decipher.setAuthTag(authTag)

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

export const signWebhookPayload = ({
  body,
  secret,
  timestamp,
}: {
  body: string
  secret: string
  timestamp: string
}) => {
  return createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')
}
