const dotenv = require('dotenv')

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const envFound = dotenv.config({ path: '../.env' })
if (!envFound) console.log("⚠️  Couldn't find .env file")

module.exports = {
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY,
  bitly_token: process.env.BITLY_TOKEN,
  webhookid: process.env.WEBHOOK_ID,
  filename: process.env.FILE_NAME,
  db_host: process.env.DB_HOST,
  port: process.env.PORT,
  projectId: process.env.PROJECT_ID,
  line: {
    channelAccessToken: process.env.DEV_CHANNEL_TOKEN,
    channelSecret: process.env.DEV_CHANNEL_SECRET,
  },
}
