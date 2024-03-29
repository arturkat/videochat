// const express = require('express')
// const app = express()
// const { createServer } = require("http")
// const server = require('http').Server(app)
// const io = require('socket.io')(server)
// const {v4: uuidV4} = require('uuid')

const express = require('express')
const http = require('http')
const socketIO = require('socket.io')

const app = express()
const httpServer = http.createServer(app)
const socketServer = socketIO.Server
const io = new socketServer(httpServer)

const {v4: uuidV4} = require('uuid')

app.set('view engine', 'ejs') // Tell Express we are using EJS
app.use(express.static('public')) // Tell express to pull the client script from the public folder

// If they join the base link, generate a random UUID and send them to a new room with said UUID
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

// If they join a specific room, then render that room
app.get('/:roomId', (req, res) => {
    res.render('room', {roomId: req.params.roomId})
})

// When someone connects to the server
io.on('connection', socket => {
    console.log('io.on.connection') // Log that someone connected
    console.log(`socket.id: ${socket.id};`)
    // console.log(`socket.rooms: ${socket.rooms}`)

    // When someone attempts to join the room
    socket.on('join-room', (roomId, peerId) => {
        console.log(`socket.on.join-room -> roomId: ${roomId}; peerId: ${peerId};`)
        socket.join(roomId)  // Join the room
        socket.broadcast.emit('user-connected', peerId) // Tell everyone else in the room that we joined

        // Communicate the disconnection
        socket.on('disconnect', () => {
            console.log('socket.on.join-room.disconnect')
            socket.broadcast.emit('user-disconnected', peerId) // Tell everyone else in the room that we left
        })
    })

    const count = io.engine.clientsCount
    console.log(`count: ${count};`)
})

// Broadcasting to all connected clients
// io.emit("hello")

// Broadcasting to all connected clients in the "news" room
// io.to("news").emit("hello")

// server.listen(3000) // Run the server on the 3000 port
httpServer.listen(3000, () => {
    console.log('http://localhost:3000')
})
