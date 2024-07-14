import express from 'express';
import http from 'http';
import WebSocket, {WebSocketServer} from 'ws';
import dotenv from 'dotenv'

// //Caminho da pasta
// import { dirname } from 'path';
// import { fileURLToPath } from 'url';

// const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config()
//Configuração do servidor 
const app = express()
const server = http.createServer(app)

const wss = new WebSocketServer({ server })

const PORT = process.env.PORT
const URL = process.env.URL+`:${PORT}`
//Variáveis importantes
let clients = []
let rooms = []

const ACTIONS = {
    ADMIN: 'admin',
    DRAW: 'draw',
    CLIENT_COUNT_UPDATE: 'clientCountUpdate',
    SETROOM: 'setRoom',
}

app.use('/public', express.static('public'))
app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'))
app.get('/client/:idRoom/:name', (req, res) => res.sendFile(__dirname + '/public/client.html'))
app.get('/admin/:idRoom/:name', (req, res) => res.sendFile(__dirname + '/public/admin.html'))


wss.on('connection', (ws) => {
    updateAdminClientCount()
    ws.on('close', () => {
        updateAdminClientCount()
    })
    ws.on('message', handleIncomingMessage.bind(null, ws))
})

function handleIncomingMessage(ws, msg) {
    const data = JSON.parse(msg)
    const action = data.action

    switch (action) {
      case ACTIONS.ADMIN:
        ws.isAdmin = true
        updateAdminClientCount()//Limpar as constantes chamadas de funções
        break;
      case ACTIONS.DRAW:
        handleDraw(data.code)
        break;
      default:
        console.warn('Ação desconhecida:', action)
    }
}

function handleDraw(confirmationCode){
    let participants = Array.from(wss.clients).filter(
      (client) => !client.isAdmin
    )
    const winner = participants[Math.floor(Math.random() * participants.length)]
  
    participants.forEach((client) => {
      let result = JSON.stringify({ status: 'youlose' });
      if (client === winner) {
        result = JSON.stringify({ status: 'youwin', code: confirmationCode })
      }
      client.send(result)
    })
}

function updateAdminClientCount(){
    const clientCount = Array.from(wss.clients).filter(
        (client) => !client.isAdmin 
    ).length

    Array.from(wss.clients).forEach((client) => {
        if(client.isAdmin && client.readyState === WebSocket.OPEN){
            client.send(
                JSON.stringify({
                    action: ACTIONS.CLIENT_COUNT_UPDATE,
                    count: clientCount,
                })
            )
        }
    })
}

// function setRoom(ws){
//     if(ws.isAdmin){
//         // console.log(rooms)
//         ws.send(
//             JSON.stringify({
//                 action: ACTIONS.SETROOM,
//                 id: ws.roomId,
//             })
//         )
//     }
// }

server.listen(PORT, () => {
    console.log(`Server is running on ${URL} !`)
})