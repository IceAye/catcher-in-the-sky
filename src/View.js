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

  #skyGridContainer;

  #settingsDraft;


  render(gameDTO , settingsDTO) {
    this.#root.innerHTML = '';
    this.#root.classList.add('container');

    this.#root.append(gameDTO.status);

    this.#renderSettingsBoard(settingsDTO);

    if (gameDTO.status === GAME_STATUSES.PENDING) {
      this.#renderStartScreen(settingsDTO);
    } else if (gameDTO.status === GAME_STATUSES.IN_PROGRESS) {
      this.#renderGameScreen(gameDTO , settingsDTO);
    }
  }

  #renderStartScreen() {
    const startScreen = document.createElement('div');
    startScreen.classList.add('main-elements');

    startScreen.appendChild(this.#renderButton());

    this.#root.appendChild(startScreen);
  }

  #renderSettingsBoard(settingsDTO) {
    const { skySize , gameTime , pointsToWin , glitchSpeedJump , isSettingsActive } = settingsDTO;

    const settingsBoard = document.createElement('div');
    settingsBoard.classList.add('top-items');

    settingsBoard.append(
      this.#renderConfigLine('Points to win' , pointsToWin.presets || pointsToWin.total , 'pointsToWin' ,
                             isSettingsActive));
    settingsBoard.append(this.#renderConfigLine('Sky size' , skySize.presets , 'skySize' , isSettingsActive));
    settingsBoard.append(
      this.#renderConfigLine('Glitch\'s jump speed' , glitchSpeedJump.levels , 'glitchSpeedJump' , isSettingsActive));
    settingsBoard.append(this.#renderConfigLine('Game time' , gameTime , 'gameTime' , isSettingsActive));

    this.#root.appendChild(settingsBoard);
  }

  #renderConfigLine(labelText , options , id , isActive) {
    const configLine = document.createElement('div');
    configLine.classList.add('line');

    const labelEl = document.createElement('label');
    labelEl.htmlFor = id;
    labelEl.textContent = `${labelText}:`;

    const slot = document.createElement('div');
    slot.classList.add('slot');

    const element = typeof options === 'object'
                    ? slot.appendChild(this.#renderSelect(id , options))
                    :
                    slot.appendChild(this.#appendCustomInput(id , options));

    if (!isActive) {
      element.disabled = true;
      element.classList.add('disabled');
      labelEl.classList.add('disabled');
    }

    slot.appendChild(element);
    configLine.append(labelEl , slot);

    return configLine;
  }

  #renderSelect(id , options) {
    const selectEl = document.createElement('select');
    selectEl.id = id;
    selectEl.classList.add('slot');
    selectEl.name = 'select';

    this.#renderOptions(selectEl , options);

    selectEl.addEventListener('change' , (event) => {
      if (event.target.tagName === 'SELECT') {
        const selectedValue = event.target.value;

        if (selectedValue === 'custom') {
          const slot = selectEl.parentElement;

          slot.innerHTML = '';
          const input = this.#appendCustomInput(id);
          slot.appendChild(input);
          input.focus();
        } else {
          this.#updateSingleSetting(id , selectedValue);
        }
      }
    });

    return selectEl;
  }

  #renderOptions(selectEl , options) {
    // todo: change value for selected if presets ? onStart -> fill with settings
    if (typeof options === 'object' && options !== null) {
      const rows = Object.keys(options);
      for (const row of rows) {
        this.#appendSingleOption(selectEl , row);
      }
    } else {
      this.#appendSingleOption(selectEl , options);
    }
  }

  #appendSingleOption(selectEl , value) {
    const optionEl = document.createElement('option');
    optionEl.value = String(value);
    optionEl.textContent = String(value);
    selectEl.append(optionEl);
  }

  #appendCustomInput(id , value) {
    const inputEl = document.createElement('input');
    inputEl.classList.add('slot');
    inputEl.type = 'number';
    inputEl.value = value ?? '';
    inputEl.placeholder = 'Enter the value';

    inputEl.addEventListener('focus' , (event) => {
      if (inputEl.value === '0') {
        inputEl.value = '';
      }
    });

    inputEl.addEventListener('change' , (event) => {
      // todo: transfer type change to SettingsDraftBuilder
      const inputValue = Number(event.currentTarget.value);

      if (id === 'pointsToWin') {
        this.#updateSingleSetting(id , 'custom' , inputValue);
      } else {
        this.#updateSingleSetting(id , inputValue);
      }

    });

    return inputEl;
  }

  #updateSingleSetting(id , selectedOption , customInput) {
    if (id === 'pointsToWin') {
      if (selectedOption === 'custom') {
        this.#settingsDraft = { ...this.#settingsDraft , [id]: { mode: selectedOption , customPoints: customInput } };
      } else {
        this.#settingsDraft = {
          ...this.#settingsDraft ,
          [id]: { mode: selectedOption }
        };
      }
    }
    if (id === 'skySize') {
      const sizeNumber = Number(selectedOption[0]);
      this.#settingsDraft = {
        ...this.#settingsDraft ,
        [id]: { columnsCount: sizeNumber , rowsCount: sizeNumber }
      };
    }
    if (id === 'glitchSpeedJump') {
      this.#settingsDraft = {
        ...this.#settingsDraft ,
        [id]: { level: selectedOption }
      };
    }
    if (id === 'gameTime') {
      this.#settingsDraft = {
        ...this.#settingsDraft ,
        [id]: selectedOption
      };
    }
  }

  #renderButton() {
    const button = document.createElement('button');
    button.classList.add('button' , 'main-button');
    button.append('Start game');
    button.addEventListener('click' , () => {
      this.#settingsDraft ??= {};
      this.#onStartObserver?.(this.#settingsDraft);
    });

    return button;
  }

  #renderGameScreen(gameDTO , settingsDTO) {
    const gameScreen = document.createElement('div');

    gameScreen.classList.add('main-elements');

    gameScreen.appendChild(this.#renderScoreBoard(gameDTO , settingsDTO));
    gameScreen.appendChild(this.#renderSkyGrid(gameDTO , settingsDTO));

    this.#root.appendChild(gameScreen);
  }

  #renderSkyGrid(gameDTO , settingsDTO) {
    const { rowsCount , columnsCount } = settingsDTO.skySize;

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
      tableBody.appendChild(row);
    }
    this.#skyGridContainer.append(tableBody);
    return this.#skyGridContainer;
  }

  #renderScoreBoard(gameDTO , settingsDTO) {
    const board = document.createElement('div');
    board.classList.add('result-container');

    board.appendChild(this.#renderCatchersPoints(gameDTO));
    board.appendChild(this.#renderPointsToWin(settingsDTO));
    board.appendChild(this.#renderFormattedTime(gameDTO));

    return board;
  }

  #renderScoreBlock(title , value) {
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
    const { score } = gameDTO;

    const fragment = document.createDocumentFragment();

    for (const catcherId in score) {
      const title = `Catcher ${catcherId}`;
      const block = this.#renderScoreBlock(title , score[catcherId].points);
      fragment.appendChild(block);
    }

    return fragment;
  }

  #renderPointsToWin(settingsDTO) {
    const { pointsToWin } = settingsDTO;
    return this.#renderScoreBlock('Points to win' , pointsToWin.total);
  }

  #renderFormattedTime(gameDTO) {
    const { minutes , seconds } = gameDTO.remainingTime;
    return this.#renderScoreBlock('Remaining time' , `${minutes}:${seconds.toString().padStart(2 , '0')}`);
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