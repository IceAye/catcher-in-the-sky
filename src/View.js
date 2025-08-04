import { GAME_STATUSES , MOVE_DIRECTIONS } from './shared/constants.js';

export class View {
  #root;
  #gameClock;
  #skyGridContainer;

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

  render(dto) {
    this.#root.innerHTML = '';

    this.#root.append(dto.status);

    if (dto.status === GAME_STATUSES.PENDING) {
      this.#renderStartScreen(dto);
    } else if (dto.status === GAME_STATUSES.IN_PROGRESS) {
      this.#renderGameScreen(dto);
    }

  }

  #renderStartScreen(dto) {
    const button = document.createElement('button');
    button.append('Start game');
    button.addEventListener('click' , () => {
      this.#onStartObserver?.();
    });

    this.#root.appendChild(button);
  }

  #renderGameScreen(dto) {
    this.#renderFormattedTime(dto.remainingTime);
    this.#renderSkyGrid(dto);
  }

  #renderSkyGrid(dto) {
    this.#skyGridContainer = document.createElement('table');

    for (let y = 0; y < 4; y++) {
      const row = document.createElement('tr');

      for (let x = 0; x < 4; x++) {
        const cell = document.createElement('td');

        if (dto.glitchPosition.x === x && dto.glitchPosition.y === y) {
          cell.append('🎇');
        }

        if (dto.catcherOnePosition?.x === x && dto.catcherOnePosition?.y === y) {
          cell.append('🏃‍♀️');
        }

        if (dto.catcherTwoPosition.x === x && dto.catcherTwoPosition.y === y) {
          cell.append('🏃🏽‍♂️');
        }

        row.append(cell);
      }
      this.#skyGridContainer.append(row);
    }
    this.#root.append(this.#skyGridContainer);
  }

  #renderFormattedTime({ minutes , seconds }) {
    this.#gameClock = document.createElement('div');
    this.#gameClock.classList.add('game-clock');
    this.#gameClock.textContent = `${minutes}:${seconds.toString().padStart(2 , '0')}`;

    this.#root.appendChild(this.#gameClock);
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