const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const history = [];

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Enviar el historial de los últimos 50 mensajes al conectarse
  socket.emit('history', history);

  // Escuchar nuevos mensajes
  socket.on('chat message', (msg) => {
    // Guardar en el historial
    history.push(msg);
    if (history.length > 50) {
      history.shift();
    }
    // Emitir a todos los clientes
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Backend de chat-global escuchando en el puerto ${PORT}`);
});
