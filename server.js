import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()
console.log('API key loaded:', process.env.VITE_ANTHROPIC_API_KEY ? 'yes' : 'NO - KEY IS MISSING')

const app = express()
app.use(cors())
app.use(express.json())

const API = process.env.VITE_ANTHROPIC_API_KEY;

app.post('/api/claude', async (req, res) => {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify(req.body)
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Anthropic API error:', JSON.stringify(data, null, 2))
            return res.status(response.status).json(data)
        }

        res.json(data)
    } catch (err) {
        console.error('Fetch error:', err.message)
        res.status(500).json({ error: err.message })
    }
})

app.listen(3001, () => console.log('Proxy running on http://localhost:3001'))