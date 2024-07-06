import express from 'express'
import dotenv from 'dotenv'
import http from 'http'
import WebSocket from 'ws'

dotenv.config()

const app = express()
const server = http.createServer(app)

const wss = new WebSocket.Server({ server })

const PORT = process.env.PORT
const URL = process.env.URL+`:${PORT}`

const ACTIONS = {
    ADMIN: 'admin',
    DRAW: 'draw',
    CLIENT_COUNT_UPDATE: 'clientCountUpdate'
}

app.use('/public', express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/public/admin.html')
})

app.listen(PORT, () => {
    console.log(`Server is running on ${URL}!`)
})

let clients = []

wss.on('connection', () => {
    clients.push(wss)
    updateAdminCount()
})

function updateAdminCount(){
    const clientCount = Array.from(wss.clients).filter(
        (client) => { !client.isAdmin}
    ).length

    Array.from(wss.clients).forEach((client) => {
        if(client.isAdmin && client.readyState === WebSocket.OPEN){
            client.send(
                JSON.stringify({
                    action: ACTIONS.CLIENT_COUNT_UPDATE,
                    count: clientCount
                })
            )
        }
    })
}