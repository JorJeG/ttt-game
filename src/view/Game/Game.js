import React, { Component } from 'react';
import { Board } from '../';
import calculateWinner from '../../js/calculateWinner';
import {soundManager} from '../../js/soundmanager2';
import socket from '../../js/socket';
import './Game.css';

let cellSound1 = null;
let cellSound2 = null;

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      disabled: false
    };
    this.handleStep = this.handleStep.bind(this);
  }
  
  componentDidMount() {
    soundManager.setup({
      preferFlash: true,
      flashVersion: 9,
      url: './script/swf/',
      useHighPerformance: true,
      debugMode: false, // disable debug mode
      onready: function() {
        // soundManager is ready to use (create sounds and so on)
        cellSound1 = soundManager.createSound({
          id: 'cellSound1',
          url: './audio/fingerplop.mp3',
          volume: 50,
          multiShot: false,
          autoLoad: true
        });
        cellSound2 = soundManager.createSound({
          id: 'cellSound2',
          url: './audio/fingerplop2.mp3',
          volume: 80,
          multiShot: false,
          autoLoad: true
        });
      }
    });
    socket.on('step', this.handleStep);
  }
  
  componentWillReceiveProps(nextProps) {
    // Начинает игру сначала если оппонент отсоединился
    if(nextProps.game === false || nextProps.restart === true) {
      const curHistory = this.state.history.concat([
        {
          squares: Array(9).fill(null)
        }
      ]);
      this.setState({
        history: curHistory,
        stepNumber: 0,
        xIsNext: true,
        disabled: false
      });
    }
  }
  handleStep(data) {
    this.setState({
      history: data.history,
      stepNumber: data.step,
      xIsNext: data.xIsNext,
      disabled: false
    });
  }

  handleClick(i) {
    if (this.state.disabled) {
      return;
    }
    if (this.state.stepNumber === 0 && !this.props.first) {
      return;
    }
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares, this.props.login) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    const curHistory = history.concat([
      {
        squares: squares
      }
    ]);
    const winner = calculateWinner(squares, this.props.login);
    if (winner || history.length === 9) {
      socket.emit('winner', {login: winner, room: this.props.room});
    }
    
    this.setState({
      history: history.concat([
        {
          squares: squares
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      disabled: true
    });
    if (this.props.first) {
      cellSound1.play();
    } else {
      cellSound2.play();
    }
    socket.emit('step', {
      room: this.props.room,
      curHistory,
      step: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const show = this.props.game ? 'show' : '';

    return (
      <div className={`game ${show}`}>
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
          />
        </div>
      </div>
    );
  }
}

export default Game;