import React, { Component } from 'react';
import socket from '../../js/socket';
import './MessagesList.css';

class MessagesList extends Component {
  constructor() {
    super()
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.handleRestart = this.handleRestart.bind(this);
  }
  componentDidMount() {
    this.scrollToBottom();
  }
  componentDidUpdate() {
    this.scrollToBottom();
  }
  handleRestart() {
    socket.emit('restart', {room: this.props.room});
  }
  scrollToBottom() {
    this.messageEnd.scrollIntoView({behavior: 'smooth'});
  }
  render() {
    const listItems = this.props.messages.map((message, index) => {
      if (message.type === 'log') {
        if (message.message === 'restart') {
          return (
            <li key={index} className={message.type}>
              <span className="message-body">
                <button
                  className='restart'
                  onClick={this.handleRestart}>RESTART</button>
              </span>
            </li>
          );
        }
        return (
          <li key={index} className={message.type}>
            <span className="message-body">{message.message}</span>
          </li>
        );
      }
      return (
        <li key={index} className={message.type}>
          <span className="username">{message.login}</span>
          <span className="message-body">{message.message}</span>
        </li>
      );
    })
    return (
      <ul className='chat__messages'>
        {listItems}
        <li className='last-message' ref={(el) => this.messageEnd = el}></li>
      </ul>
    );
  }
}

export default MessagesList;
