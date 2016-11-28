![Image of Kurz.io](http://photon.modernator.me:/album/rico345100@gmail.com/git/kurzio/noti.png)

# Kurz.io - Client
Realtime chat app built by Electron + React + Redux.

## Run
1. Install electron deps
```bash
$ npm install
```

2. Install client build deps
```bash
$ cd html
$ npm install
```

3. Build Resources
```bash
$ gulp build
```

4. Run Electron
```bash
$ cd ../
$ npm start
```

## Building an app
For Windows
```bash
$ npm run build:win
```

For MacOS
```bash
$ npm run build:osx
```

Both
```bash
$ npm run build
```

## Packaging an app
For Windows
```bash
$ npm run package:win
```

For MacOS
```bash
$ npm run package:osx
```

Both
```bash
$ npm run package
```

## Requires
- Node.js >= 4.x

## Note
This application is not built for production usage, develop for studying purpose. It uses WebSocket to communicate realtime by Socket.io, saves each channels and messages into MongoDB.
Much of code are not good to see, because when I made this app, I was not experienced like these technologies.

## Bugs
Packaging for Windows Platform will not trigger notification properly, it is bug when using electron-packager.

## Screenshots
![Screenshot2](http://photon.modernator.me:/album/rico345100@gmail.com/git/kurzio/2.png)
![Screenshot1](http://photon.modernator.me:/album/rico345100@gmail.com/git/kurzio/1.png)