TODO:

1. Place catchers in the sky (random position for both). First catchers, than Glitch
2. Stop the game if Glitch gets enough points.
3. Glitch must jump to empty cell (check and if a player is in the cell - jump to another).
4. Create classes:
   - ✅ Position (informational expert/creator - GRASP),
   - ✅ Glitch (informational expert/creator - GRASP),
   - ✅ Settings (DI/infrastructure),
   - ✅ SkySettings (DI),
   - ✅ JumpSetting
   - ✅ Catcher (Glitch alike)
   - ✅ Unit => Catcher extends Unit, Glitch extends Unit

// new Game (new Settings(new SkySettings()))
// entity objects vs value objects (DDD)
// classes -> to separate files

/game-project
├── /src
│ ├── /frontend
│ │ ├── /components # UI-компоненты / классы
│ │ ├── /assets # изображения, звуки
│ │ ├── /styles # CSS / SCSS
│ │ └── index.js # точка входа
│ ├── /backend
│ │ ├── /controllers # логика API / игры
│ │ ├── /models # классы игровых сущностей (например, Enemy, Player)
│ │ ├── /routes # API-роуты
│ │ └── server.js # запуск сервера (Express, например)
│ └── /shared # общие утилиты, константы
│ └── utils.js
├── /tests
│ ├── /unit # юнит-тесты классов и функций
│ ├── /integration # связка фронта и бэка
│ └── jest.config.js
├── /public # html-шаблоны, favicon и пр.
│ └── index.html
├── package.json
└── README.md
