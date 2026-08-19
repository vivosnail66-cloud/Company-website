import type { EmailAdapter } from 'payload'
import nodemailer from 'nodemailer'

export const createSMTPEmailAdapter = (): EmailAdapter | undefined => {
  if (!process.env.SMTP_HOST) return undefined

  const port = Number(process.env.SMTP_PORT || 587)
  const secure = process.env.SMTP_SECURE === 'true'
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const defaultFromAddress = process.env.SMTP_FROM_ADDRESS || 'noreply@example.com'
  const defaultFromName = process.env.SMTP_FROM_NAME || 'Gotocosmic CMS'

  return () => {
    const transporter = nodemailer.createTransport({
      auth: user && pass ? { pass, user } : undefined,
      host: process.env.SMTP_HOST,
      port,
      secure,
    })

    return {
      defaultFromAddress,
      defaultFromName,
      name: 'smtp',
      sendEmail: async (message) => {
        return transporter.sendMail({
          ...message,
          from: message.from || {
            address: defaultFromAddress,
            name: defaultFromName,
          },
        })
      },
    }
  }
}
