export const settingsConfig = {
  skySize: {
    id: 'skySize',
    label: 'Sky size',
    type: 'select',
    presets: {
      '4x4': { columnsCount: 4, rowsCount: 4 },
      '5x5': { columnsCount: 5, rowsCount: 5 },
      '6x6': { columnsCount: 6, rowsCount: 6 },
      '7x7': { columnsCount: 7, rowsCount: 7 },
      '8x8': { columnsCount: 8, rowsCount: 8 }
    },
    default: '4x4',
  },

  pointsToWin: {
    id: 'pointsToWin',
    label: 'Points to win',
    type: 'select',
    presets: {
      duel: 150,
      blitz: 50,
      marathon: 300,
      custom: null
    },
    default: 'duel'
  },

  gameTime: {
    id: 'gameTime',
    label: 'Game time',
    type: 'input',
    default: 2
  },

  glitchSpeedJump: {
    id: 'glitchSpeedJump',
    label: 'Glitch Speed Jump',
    type: 'select',
    presets: {
      rookie: 1600,
      junior: 1200,
      amateur: 800,
      pro: 400
    },
    default: 'junior'
  },

  soundEnabled: {
    id: 'soundEnabled',
    label: 'Sound',
    type: 'toggle',
    default: true,
  },

};
