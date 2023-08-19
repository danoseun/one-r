import app from './src/app'

require('dotenv').config()

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log('-'.repeat(80))
  console.log(`Whatsapp Support is currently running on ${PORT}`)
  console.log('-'.repeat(80))
})
