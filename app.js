import "dotenv/config.js";
import path from "path"
import express from "express"
import { fileURLToPath } from 'url';
import { Server } from "socket.io";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the "public" folder

app.use(express.static(path.join(__dirname, "/public")));

const server=app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})

const io = new Server(server);

let socketsConnected = new Set()

io.on('connection',onConnection)

function onConnection(socket) {
    console.log("Socket ID:",socket.id);
    socketsConnected.add(socket.id);

    io.emit('clients-total',socketsConnected.size);

    socket.on("message", (data)=>{
        socket.broadcast.emit("chat-message", data);
    })

    socket.on('disconnect', () => {
        console.log(`User ${socket.id} disconnected`);
        socketsConnected.delete(socket.id);
        io.emit('clients-total',socketsConnected.size);
    });

    socket.on('feedback', (data) => {
        socket.broadcast.emit('feedback', data);
    });
}

