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

  #soundButton = null;


  #onStartObserver;
  #onCatcherOneMoveObserver;
  #onCatcherTwoMoveObserver;

  #renderStartScreen() {
    const startScreen = document.createElement('div');
    startScreen.classList.add('main-elements');

    startScreen.appendChild(this.#renderStartButton());

    this.#root.appendChild(startScreen);
  }
  #onRestartObserver;
  #onToggleSoundObserver;

  set onstart(observer) {
    this.#onStartObserver = observer;
  }

  set onCatcherOneMove(observer) {
    this.#onCatcherOneMoveObserver = observer;
  }

  set onCatcherTwoMove(observer) {
    this.#onCatcherTwoMoveObserver = observer;
  }

  set onRestart(observer) {
    this.#onRestartObserver = observer;
  }

  set onToggleSound(observer) {
    this.#onToggleSoundObserver = observer;
  }

  render(gameDTO , settingsDTO) {
    this.#root.innerHTML = '';
    this.#root.classList.add('container');

    this.#root.append(gameDTO.status);

    if (settingsDTO.isSettingsActive && !this.#settingsDraft) {
      this.#settingsDraft = structuredClone(settingsDTO);
    }
    console.log(this.#settingsDraft);

    const settingsToRender = settingsDTO.isSettingsActive ? this.#settingsDraft : settingsDTO;

    this.#renderSettingsBoard(settingsToRender);

    if (gameDTO.status === GAME_STATUSES.PENDING) {
      this.#renderStartScreen(settingsToRender);
    } else if (gameDTO.status === GAME_STATUSES.IN_PROGRESS) {
      this.#renderGameScreen(gameDTO , settingsToRender);
    }
  }

  showModal(outcome , winnerId , stats) {
    const modal = this.#renderModal(outcome , winnerId , stats);

    this.#root.appendChild(modal);
  }

  hideModal() {
    const modal = this.#root.querySelector('.modal');
    // todo: refactor null
    this.#root.removeChild(modal);
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

  #renderStartButton() {
    const button = document.createElement('button');
    button.classList.add('button' , 'main-button');
    button.textContent = 'Start game';
    button.addEventListener('click' , () => {
      this.#onStartObserver?.(this.#settingsDraft);
    });

    return button;
  }

  #renderFormattedTime(gameDTO) {
    const { minutes , seconds } = gameDTO.remainingTime;
    return this.#renderScoreBlock('Remaining time' , `${minutes}:${seconds.toString().padStart(2 , '0')}`);
  }

  #renderSoundBar(soundEnabled) {
    if (this.#soundButton) {
      return this.#soundButton.parentElement;
    }

    const toggler = document.createElement('div');
    toggler.classList.add('switch-button');

    const togglerLabel = document.createElement('label');
    togglerLabel.textContent = 'Sound on';

    this.#soundButton = document.createElement('button');
    this.#soundButton.classList.add('toggle');

    const spanEl = document.createElement('span');
    spanEl.classList.add('icon-slider');
    this.#soundButton.appendChild(spanEl);

    this.updateSoundButton(soundEnabled);

    this.#soundButton.addEventListener('click' , () => {
                                         this.#onToggleSoundObserver?.();
                                       }
    );

    toggler.append(togglerLabel , this.#soundButton);

    return toggler;
  }

  updateSoundButton(soundEnabled) {
    if (!this.#soundButton) return;
    this.#soundButton.classList.toggle('on' , soundEnabled);
  }

  #renderModal(outcome , winnerId , stats) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    const iconSrc =
      outcome === 'win' ? '/src/front/assets/icons/winnerIcon.svg' : '/src/front/assets/icons/lossIcon.svg';
    const titleText = outcome === 'win' ? `Catcher ${winnerId} Win!` : 'You Lose!';
    const subtitleText =
      outcome === 'win' ? 'Congratulations' : 'You\'ll be lucky next time';

    modal.innerHTML = `
  <div class="modal-decoration">
    <img src="${iconSrc}" alt="icon">
  </div>
  <div class="modal-elements">
    <div class="title-modal">${titleText}</div>
    <div class="text-modal">${subtitleText}</div>
    ${outcome === 'win' ? `
      <div class="modal-result">
        <div class="result-block">
          <span class="result-title">Points:</span>
          <span class="result"> ${stats.points}</span>
        </div>
      </div>
    ` : ''}
    <button class="button">Play again</button>
  </div>
`;

    const buttonEl = modal.querySelector('button');
    buttonEl.addEventListener('click' , () => {
      this.#onRestartObserver?.();
    });

    return modal;
  }

  #renderGameScreen(gameDTO , settingsDTO) {
    const gameScreen = document.createElement('div');

    gameScreen.classList.add('main-elements');

    gameScreen.appendChild(this.#renderScoreBoard(gameDTO , settingsDTO));
    gameScreen.appendChild(this.#renderSkyGrid(gameDTO , settingsDTO));

    this.#root.appendChild(gameScreen);
  }

  #renderSettingsBoard(settingsDTO) {
    const { skySize , gameTime , pointsToWin , glitchSpeedJump , isSettingsActive , soundEnabled } = settingsDTO;

    const settingsBoard = document.createElement('div');
    settingsBoard.classList.add('top-items');

    settingsBoard.append(
      this.#renderConfigLine(pointsToWin.label , pointsToWin.type ,
                             {
                               options: pointsToWin.presets ,
                               selectedKey: this.#settingsDraft.pointsToWin.selectedKey ,
                               value: pointsToWin.value.customPoints
                             } , pointsToWin.id ,
                             isSettingsActive));
    settingsBoard.append(this.#renderConfigLine(skySize.label , skySize.type , {
      options: skySize.presets ,
      selectedKey: this.#settingsDraft.skySize.selectedKey ,
      value: skySize.value
    } , skySize.id , isSettingsActive));
    settingsBoard.append(
      this.#renderConfigLine(glitchSpeedJump.label , glitchSpeedJump.type , {
        options: glitchSpeedJump.presets ,
        selectedKey: this.#settingsDraft.glitchSpeedJump.selectedKey ,
        value: glitchSpeedJump.value.level
      } , glitchSpeedJump.id , isSettingsActive));
    settingsBoard.append(this.#renderConfigLine(gameTime.label , gameTime.type, { selectedKey: this.#settingsDraft.gameTime.selectedKey, value: gameTime.value }, gameTime.id ,    isSettingsActive));
    settingsBoard.append(this.#renderSoundBar(soundEnabled));

    this.#root.appendChild(settingsBoard);
  }

  #renderConfigLine(labelText , type , { options , selectedKey , value } , id , isActive) {
    const configLine = document.createElement('div');
    configLine.classList.add('line');

    const labelEl = document.createElement('label');
    labelEl.htmlFor = id;
    labelEl.textContent = `${labelText}:`;

    const slot = document.createElement('div');
    slot.classList.add('slot');


    let element;

    if (!isActive) {
      element = this.#appendCustomInput(id , selectedKey);
      element.disabled = true;
      element.classList.add('disabled');
      labelEl.classList.add('disabled');
    } else {
      element = type === 'select' && selectedKey !== 'custom'
                      ? slot.appendChild(this.#renderSelect(id , { options , selectedKey }))
                      : slot.appendChild(this.#appendCustomInput(id , value));
    }

    slot.appendChild(element);

    configLine.append(labelEl , slot);

    return configLine;
  }

  #renderSelect(id , { options , selectedKey }) {
    const selectEl = document.createElement('select');
    selectEl.id = id;
    selectEl.classList.add('slot');
    selectEl.name = 'select';

    this.#renderOptions(selectEl , { options , selectedKey });

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

  #renderOptions(selectEl , { options , selectedKey }) {
    if (typeof options === 'object' && options !== null) {
      const rows = Object.keys(options);
      for (const row of rows) {
        const isSelected = row === selectedKey;
        this.#appendSingleOption(selectEl , row , isSelected);
      }
    }
  }

  #appendSingleOption(selectEl , selectedKey , isSelected = false) {
    const optionEl = document.createElement('option');
    optionEl.value = String(selectedKey);
    optionEl.textContent = String(selectedKey);

    if (isSelected) {
      optionEl.selected = true;
    }

    selectEl.append(optionEl);
  }

  #appendCustomInput(id , value) {
    const inputEl = document.createElement('input');
    inputEl.id = id;
    inputEl.classList.add('slot');
    inputEl.type = 'number';
    inputEl.value = value;
    inputEl.placeholder = value ?? 'Enter the value';

    inputEl.addEventListener('focus' , (event) => {
      if (inputEl.value === '0') {
        inputEl.value = '';
      }
    });

    inputEl.addEventListener('change' , (event) => {
      const inputValue = event.currentTarget.valueAsNumber;
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
        this.#settingsDraft = {
          ...this.#settingsDraft ,
          [id]: {
            ...this.#settingsDraft[id] ,
            selectedKey: selectedOption ,
            value: {
              mode: selectedOption ,
              customPoints: customInput
            }
          }
        };
      } else {
        this.#settingsDraft = {
          ...this.#settingsDraft ,
          [id]: { ...this.#settingsDraft[id] , selectedKey: selectedOption , value: { mode: selectedOption } }
        };
      }
    }
    if (id === 'skySize') {
      const sizeNumber = Number(selectedOption[0]);
      this.#settingsDraft = {
        ...this.#settingsDraft ,
        [id]: {
          ...this.#settingsDraft[id] ,
          selectedKey: selectedOption ,
          value: {
            columnsCount: sizeNumber ,
            rowsCount: sizeNumber
          }
        }
      };
    }
    if (id === 'glitchSpeedJump') {
      this.#settingsDraft = {
        ...this.#settingsDraft ,
        [id]: {
          ...this.#settingsDraft[id] ,
          selectedKey: selectedOption ,
          value: {
            level: selectedOption
          }
        }
      };
    }
    if (id === 'gameTime') {
      this.#settingsDraft = {
        ...this.#settingsDraft ,
        [id]: { ...this.#settingsDraft[id] , selectedKey: selectedOption, value: selectedOption }
      };
    }
  }

  #renderSkyGrid(gameDTO , settingsDTO) {
    const { rowsCount , columnsCount } = settingsDTO.skySize.value;

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

  #renderPointsToWin(settingsDTO) {
    const { label, value } = settingsDTO.pointsToWin;
    return this.#renderScoreBlock(label , value.total);
  }

}

