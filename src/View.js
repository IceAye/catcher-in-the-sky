import { GAME_STATUSES , MOVE_DIRECTIONS } from './shared/constants.js';

export class View {
  constructor() {
    this.#root = document.getElementById('root');
    window.addEventListener('keyup' , (event) => {
      switch (event.code) {
        case 'ArrowUp':
          this.#onCatcherOneMoveObserver?.({ direction: MOVE_DIRECTIONS.UP });
          break;
        case 'ArrowDown':
          this.#onCatcherOneMoveObserver?.({ direction: MOVE_DIRECTIONS.DOWN });
          break;
        case 'ArrowLeft':
          this.#onCatcherOneMoveObserver?.({ direction: MOVE_DIRECTIONS.LEFT });
          break;
        case 'ArrowRight':
          this.#onCatcherOneMoveObserver?.({ direction: MOVE_DIRECTIONS.RIGHT });
          break;
        case 'KeyW':
          this.#onCatcherTwoMoveObserver?.({ direction: MOVE_DIRECTIONS.UP });
          break;
        case 'KeyS':
          this.#onCatcherTwoMoveObserver?.({ direction: MOVE_DIRECTIONS.DOWN });
          break;
        case 'KeyA':
          this.#onCatcherTwoMoveObserver?.({ direction: MOVE_DIRECTIONS.LEFT });
          break;
        case 'KeyD':
          this.#onCatcherTwoMoveObserver?.({ direction: MOVE_DIRECTIONS.RIGHT });
          break;
        default:
          break;
      }
    });
  }

  #root;
  #gameClock;
  #skyGridContainer;
  #scoreBoard;

  render(gameDTO, settingsDTO) {
    this.#root.innerHTML = '';

    this.#root.append(gameDTO.status);

    if (gameDTO.status === GAME_STATUSES.PENDING) {
      this.#renderStartScreen();
    } else if (gameDTO.status === GAME_STATUSES.IN_PROGRESS) {
      this.#renderGameScreen(gameDTO, settingsDTO);
    }
  }

  #renderStartScreen() {
    const startScreen = document.createElement('div');
    startScreen.appendChild(this.#renderButton());

    this.#root.appendChild(startScreen);
  }

  #renderButton() {
    const button = document.createElement('button');
    button.classList.add('button', 'main-button');
    button.append('Start game');
    button.addEventListener('click' , () => {
      this.#onStartObserver?.();
    });

    return button;
  }

  #renderGameScreen(gameDTO, settingsDTO) {
    const gameScreen = document.createElement('div');

    gameScreen.appendChild(this.#renderScoreBoard(gameDTO, settingsDTO));
    gameScreen.appendChild(this.#renderSkyGrid(gameDTO, settingsDTO));

    this.#root.appendChild(gameScreen);
  }

  #renderSkyGrid(gameDTO, settingsDTO) {
    const {rowsCount, columnsCount} = settingsDTO.skySize;

    this.#skyGridContainer = document.createElement('table');
    this.#skyGridContainer.classList.add('table');

    const tableBody = document.createElement('tbody');

    for (let y = 0; y < rowsCount; y++) {
      const row = document.createElement('tr');

      for (let x = 0; x < columnsCount; x++) {
        const cell = document.createElement('td');
        cell.classList.add('cell');

        if (gameDTO.glitchPosition.x === x && gameDTO.glitchPosition.y === y) {
          cell.append('🎇');
        }

        if (gameDTO.catcherOnePosition.x === x && gameDTO.catcherOnePosition.y === y) {
          cell.append('🏃‍♀️');
        }

        if (gameDTO.catcherTwoPosition.x === x && gameDTO.catcherTwoPosition.y === y) {
          cell.append('🏃🏽‍♂️');
        }

        row.append(cell);
      }
      tableBody.appendChild(row)
    }
    this.#skyGridContainer.append(tableBody);
    return this.#skyGridContainer;
  }



  #renderScoreBoard(gameDTO, settingsDTO) {
    const board = document.createElement('div');
    board.classList.add('result-container');

    board.appendChild(this.#renderCatchersPoints(gameDTO));
    board.appendChild(this.#renderPointsToWin(settingsDTO));
    board.appendChild(this.#renderFormattedTime(gameDTO));

    return board;
  }

  #renderScoreBlock(title, value) {
    const block = document.createElement('div');
    block.className = 'result-block';

    const titleEl = document.createElement('span');
    titleEl.className = 'result-title';
    titleEl.textContent = `${title}:`;

    const valueEl = document.createElement('span');
    valueEl.className = 'result';
    valueEl.textContent = value;

    block.appendChild(titleEl);
    block.appendChild(valueEl);

    return block;
  }

  #renderCatchersPoints(gameDTO) {
    const {score} = gameDTO;

    const fragment = document.createDocumentFragment();

    for (const catcherId in score) {
      const title = `Catcher ${catcherId}`;
      const block = this.#renderScoreBlock(title, score[catcherId].points);
      fragment.appendChild(block);
    }

    return fragment;
  }

  #renderPointsToWin(settingsDTO) {
    const {pointsToWin} = settingsDTO;
    return this.#renderScoreBlock('Points to win', pointsToWin.total);
  }

  #renderFormattedTime(gameDTO) {
    const { minutes , seconds } = gameDTO.remainingTime;
    return this.#renderScoreBlock('Remaining time', `${minutes}:${seconds.toString().padStart(2 , '0')}`);
  }


  #onStartObserver;
  set onstart(observer) {
    this.#onStartObserver = observer;
  }

  #onCatcherOneMoveObserver;
  set onCatcherOneMove(observer) {
    this.#onCatcherOneMoveObserver = observer;
  }

  #onCatcherTwoMoveObserver;
  set onCatcherTwoMove(observer) {
    this.#onCatcherTwoMoveObserver = observer;
  }
}