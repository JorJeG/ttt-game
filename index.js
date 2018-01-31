// Setup basic express server
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3001;
const {Users} = require('./helpers/Users');

const users = new Users();

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Для Chrome 500 Error
app.use(cors());

// Routing
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
}

// Chatroom
io.on('connection', function(socket) {
  // Регистрация пользователя по логину
  socket.on('add user', function(data) {
    const listUsers = users.addLogin(socket.id, data.login);
    io.to(data.room).emit('user joined', {
      login: data.login
    });
  });
  // Подключение к игре
  socket.on('first user', function(data) {
    users.addUserData(socket.id, data.room);
    socket.join(data.room);
    socket.emit('show href', data.room);
  });
  // Подключение по ссылке
  socket.on('second user', function(data) {
    if ((users.getUsersList(data.room)).length === 2) {
      socket.emit('full room');
    } else {
      users.addUserData(socket.id, data.room);
      socket.join(data.room);
    }
  });
  // Показывает второму игроку его противника
  socket.on('show opp', function(data) {
    socket.emit('show opp', { opponent: users.getUsersList(data.room)[0]});
  })
  // Отправление сообщения в чат
  socket.on('new message', function (data) {
    io.to(data.room).emit('new message', {
      login: data.login,
      message: data.message
    });
  });
  // Показывает победителя
  socket.on('winner', function(data) {
    io.to(data.room).emit('show winner', {
      login: data.login
    });
  });
  // Показывает кнопку рестарта
  socket.on('restart', function(data) {
    io.to(data.room).emit('handleRestart');
  });
  // Показывает кто печатает
  socket.on('typing', function(data) {
    io.to(data.room).emit('typing', {
      login: data.login
    })
  })
  // Останавливает
  socket.on('stop typing', function(data) {
    io.to(data.room).emit('stop typing');
  })
  
  // GAME
  socket.on('step', function(data) {
    socket.to(data.room).emit('step', {
      history: data.curHistory,
      step: data.step,
      xIsNext: data.xIsNext
    });
  });
  
  // Пользователь отсоединился
  // Здесь случаются ошибки !?!=<>
  socket.on('disconnect', function() {
    const user = users.removeUser(socket.id);
    io.to(user.room).emit('user left');
  });
});
