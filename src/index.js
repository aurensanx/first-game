import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';

function Square(props) {
  return (
    <button className={`square${props.square.active ? " winner" : ""}`} onClick={props.onClick}>
      {props.square.value}
    </button>
  )
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square key={i}
              square={this.props.squares[i]}
              onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const cells = 9;
    return (
      Array(cells).fill(0).map((r, i) => this.renderSquare(i))
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(0).map(() => ({value: null, active: false})),
      }],
      stepNumber: 0,
      xIsNext: true,
      isOrderDesc: false,
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.map(s => ({...s}));
    if (calculateWinner(squares)) {
      return;
    }
    const nextValue = this.state.xIsNext ? 'X' : 'O';
    const completed = areMovesCompleted(squares, nextValue);
    if (completed && (!squares[i].value || squares[i].value !== nextValue)) {
      return;
    }
    if (!completed && squares[i].value) {
      return;
    }

    squares[i].value = completed ? '' : this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares,
        clickedSquare: i,
      }]),
      stepNumber: history.length,
      xIsNext: completed ? this.state.xIsNext : !this.state.xIsNext,
    })
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  calculateMove(move) {
    return this.state.isOrderDesc ? this.state.history.length - 1 - move : move;
  }

  render() {
    let history = this.state.history.slice();
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    let status;
    if (winner) {
      status = 'Winner: ' + winner.winnerPlayer;
      current.squares.forEach((s, i) => {
        s.active = winner.winnerSquares.indexOf(i) > -1;
      })
    } else if (!current.squares.find(s => !s.value)) {
      status = 'Result is a draw'
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
    return (
      <div className="game">
        <div className="next-player">{status}</div>
        <div className="board-container">
          <div className="board">
            <div className="board-content">
              <Board
                squares={current.squares}
                onClick={i => this.handleClick(i)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game/>,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a].value && squares[a].value === squares[b].value && squares[a].value === squares[c].value) {
      return {winnerPlayer: squares[a].value, winnerSquares: lines[i]};
    }
  }
  return null;
}

function areMovesCompleted(squares, nextValue) {
  return squares.filter(s => s.value === nextValue).length === 3;
}
