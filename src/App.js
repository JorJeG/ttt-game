import React, { Component } from 'react';
import socket from './js/socket';
import { deleteMessage, deleteTypingMessage } from './js/helpers';
import { Game, Chat } from './view';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      login: '',
      opponent: '',
      message: '',
      chatPage: false,
      loginPage: true,
      messages: [],
      first: false,
      game: false,
      restart: false,
      typing: false,
      lastTypingTime: (new Date()).getTime(),
    };
    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleComplite = this.handleComplite.bind(this);
    this.handleSendMessage = this.handleSendMessage.bind(this);
    this.showJoined = this.showJoined.bind(this);
    this.showMessage = this.showMessage.bind(this);
    this.connectSocket = this.connectSocket.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.showWinner = this.showWinner.bind(this);
    this.handleRestart = this.handleRestart.bind(this);
    this.handleTyping = this.handleTyping.bind(this);
    this.handleStopTyping = this.handleStopTyping.bind(this);
  }
  componentDidMount() {
    // Socket events
    socket.on('connect', this.connectSocket);
    socket.on('user joined', this.showJoined);
    socket.on('new message', this.showMessage);
    socket.on('full room', () => window.location = '/');
    socket.on('user left', this.disconnect);
    socket.on('show winner', this.showWinner);
    socket.on('handleRestart', this.handleRestart);
    socket.on('typing', this.handleTyping);
    socket.on('stop typing', this.handleStopTyping);
  }
  // Обработчик при соединении к игре или к комнате по ссылке
  connectSocket(data) {
    var path = window.location.search;
    if (path === '') {
      const link = window.location.href + '?room=' + socket.id;
      const newMessage = { message: link, type: 'log' };
      const newArray = this.state.messages.concat(newMessage);
      this.setState({
        room: socket.id,
        messages: newArray,
        first: true
      });
      socket.emit('first user', {room: socket.id});
    } else {
      this.setState({
        room: path.substr(6)
      });
      socket.emit('second user', {room: path.substr(6)})
    }
  }
  // Обработчик для показа сообщения о присоединении игрока
  showJoined(data) {
    const { login, messages } = this.state;
    const link = data.login + ' joined';
    const newMessage = { login, message: link, type: 'log' };
    const newArray = messages.concat(newMessage);
    this.setState({
      messages: newArray,
      opponent: data.login,
      game: true
    });
  }
  // Показывает победителя
  showWinner(data) {
    const { messages } = this.state;
    const winner = data.login === null ? 'It is draw' : data.login + ' winner';
    const newMessage = { message: winner, type: 'log' };
    const restartMessage = { message: 'restart', type: 'log'};
    const newArray = messages.concat(newMessage, restartMessage);
    this.setState({
      messages: newArray,
      game: true,
      restart: false,
    });
  }
  // Показвает кто печатает
  handleTyping(data) {
    const { messages } = this.state;
    const newMessage = { message: data.login + ' typing', type: 'log', data: 'typing' };
    const newArray = messages.concat(newMessage);
    this.setState({
      messages: newArray,
    });
  }
  // Убирает сообщение
  handleStopTyping(data) {
    const { messages } = this.state;
    const removedMessage = deleteTypingMessage(messages);
    this.setState({
      messages: removedMessage,
    });
  }
  // Рестарт игры
  handleRestart() {
    const { messages } = this.state;
    const removedMessage = deleteMessage(messages);
    this.setState({
      messages: removedMessage,
      game: true,
      restart: true,
    });
  }
  // При дисконекте
  disconnect(data) {
    const { messages, opponent } = this.state;
    const link = opponent + ' left';
    const newMessage = { message: link, type: 'log' };
    const newArray = messages.concat(newMessage);
    this.setState({
      messages: newArray,
      opponent: '',
      game: false
    });
  }
  // Обработчик для показа сообщений
  showMessage(data) {
    const { messages } = this.state;
    const { login, message, type } = data;
    const newArray = messages.concat({ login, message, type });
    this.setState({
      messages: newArray,
    });
  }
  // Обработчик для инпутов
  handleOnChange(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value;
    const { lastTypingTime, typing, room, login } = this.state;
    if(name === 'message' && typing === false) {
      socket.emit('typing', {room, login});
      this.setState({
        [name]: value,
        typing: true,
        lastTypingTime: (new Date()).getTime()
      }, () => {
        setTimeout(() => {
          const typingTimer = (new Date()).getTime();
          const timeDiff = typingTimer - lastTypingTime;
          if (timeDiff >= 400 && this.state.typing) {
            socket.emit('stop typing', {room});
            this.setState({
              typing: false
            })
          }
        }, 1400);
      });
    } else {
      this.setState({
        [name]: value,
        lastTypingTime: (new Date()).getTime()
      });
    }
  }
  // Обработчик для отправки сообщения
  handleSendMessage(e) {
    const { login, message, room } = this.state;
    if (e.keyCode === 13 && this.state.message.length > 0) {
      socket.emit('new message', {
        message,
        room,
        login,
      });
      this.setState({
        message: '',
      });
    }
  }
  // Обработчик для регистрации под ником
  handleComplite(e) {
    const { login } = this.state;
    if (e.keyCode === 13 && login.length > 0) {
      this.setState({
        chatPage: true,
        loginPage: false,
      });
      socket.emit('add user', {
        login,
        room: window.location.search.substr(6),
      });
    }
  }
  render() {
    return (
      <div className='wrapper'>
        <Game
          room={this.state.room}
          first={this.state.first}
          game={this.state.game}
          login={this.state.login}
          restart={this.state.restart}
         />
        {this.state.chatPage && 
          <Chat
            room={this.state.room}
            message={this.state.message}
            messages={this.state.messages}
            handleOnChange={this.handleOnChange}
            handleSendMessage={this.handleSendMessage}/>
        }
        {this.state.loginPage &&
          <div className='form-login'>
            <h3 className='form-login__title'>What's your nickname?</h3>
            <input
              name='login'
              value={this.props.login}
              className='form-login__username-input'
              type='text'
              maxLength='14'
              onChange={this.handleOnChange}
              onKeyDown={this.handleComplite}
            />
          </div>
        }
      </div>
    );
  }
}

export default App;
