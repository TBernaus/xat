const port = 3000;
var express = require("express"),
  app = express(),
  server = require("http").createServer(app),
  path = require("path");

server.listen(port, (err, res) => {
  if (err) console.log(`ERROR: Connecting APP ${err}`);
  else console.log(`Server is running on port ${port}`);
});
// Import routes of our app
var routes = require("./routes/main");

// view engine setup and other configurations
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Define routes using URL path
app.use("/", routes);
module.exports = app;

//mongo
const mongoose = require("mongoose");
// Base de dades "usuaris"
// Col·lecció "messages" i "users"

//url per treballar des de classe
const mongoURL = "mongodb://root:pass12345@mongodb:27017/usuaris?authSource=admin";

//url per treballar des de casa
//const mongoURL = 'mongodb://127.0.0.1:27017/usuaris';


mongoose.connect(
  mongoURL,
  { useCreateIndex: true,
    useUnifiedTopology: true, 
    useFindAndModify: false, 
    useNewUrlParser: true },
  (err, res) => {
    if (err) console.log(`Error connectant a la base de dades.  ${err}`);
    else console.log(`Database funcionant`);
  }
);

//socket io

const Message = require('./models/message');
const socketIo = require('socket.io');
const io = socketIo(server, {connectionStateRecovery: {}});

io.on("connection", (socket) => {
  console.log("Usuario connectat");

  socket.on('join chat', (xat) => {
    // Carregar missatges dels xats
    Message.find({ xat: xat }, (err, messages) => {
        if (err) throw err;
        socket.emit('carregar missatges', messages);
    });
});

  // Client -> Servidor
  socket.on("chat message", async (data) => {
    console.log("Missatge rebut:", data);
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const hours = (now.getHours()).toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const temps = `${day}-${month} - ${hours}.${minutes}`

    // Crear un missatge nou
    const newMessage = new Message({
      username: data.username,
      content: data.content,
      xat: data.xat,
      timestamp: temps,
    });

    try {
      // Guardar el missatge en la base de dades
      const savedMessage = await newMessage.save();
      console.log("Missatge guardat en la base de dades:", savedMessage);
      
      // Emitir el missatge a tots els usuaris
      io.emit("chat message", savedMessage);

      //actualitzar usuarisActius
      const activeUsers = await Message.distinct('username', { xat: data.xat });
      io.emit("update active users", activeUsers);

    } catch (error) {
      console.error("Error al guardar el missatge en la base de dades:", error);
    }
  });

  // Desconexions
  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});


