import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 1025,
  secure: false, // true for 465, false for other ports
})

export async function sendReceiptEmail(to: string, messageContent: string, amount: number) {
  try {
    const info = await transporter.sendMail({
      from: '"Words of the World" <noreply@wordsoftheworld.com>',
      to,
      subject: 'Receipt: Your message has been queued!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">Thank you for your purchase!</h2>
          <p>Your message has been successfully queued and will be displayed on the billboard soon.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-style: italic; color: #555;">"${messageContent}"</p>
          </div>
          
          <p><strong>Total Paid:</strong> $${amount.toFixed(2)}</p>
          <p style="color: #777; font-size: 12px; margin-top: 30px;">
            You will receive another email the moment your message goes live.
          </p>
        </div>
      `,
    })
    console.log('Receipt email sent: %s', info.messageId)
  } catch (error) {
    console.error('Error sending receipt email:', error)
  }
}

export async function sendLiveNotificationEmail(to: string, messageContent: string) {
  try {
    const info = await transporter.sendMail({
      from: '"Words of the World" <noreply@wordsoftheworld.com>',
      to,
      subject: '🔥 Your message is LIVE right now!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #FAFAFA;">
          <h2 style="color: #090909;">It's happening!</h2>
          <p style="color: #090909;">Look up! Your message is currently being broadcasted on the big screen.</p>
          
          <div style="background-color: #FFFFFF; border: 1px solid #E5E5E5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h1 style="margin: 0; font-style: italic; color: #090909;">"${messageContent}"</h1>
          </div>
          
          <p style="color: #777; font-size: 12px; margin-top: 30px;">
            This broadcast will end automatically when the duration is up.
          </p>
        </div>
      `,
    })
    console.log('Live notification email sent: %s', info.messageId)
  } catch (error) {
    console.error('Error sending live notification email:', error)
  }
}
