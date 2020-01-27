![Kurz.io Title](/noti.png?raw=true "Title")

# Kurz.io - Client
Realtime chat app built by Electron + React + Redux. Check the [server](https://github.com/rico345100/Kurz.io-server) side too.

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
![Screenshot1](/2.png?raw=true "Screenshot1")
![Screenshot2](/1.png?raw=true "Screenshot2")

## Buy me a coffee!
Donations are big help for me to continue my development!

[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=PVXTU5FJNBLDS)
