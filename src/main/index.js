'use strict'

import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import fs from "fs"
import jetpack from "fs-jetpack";
const csv = require('csv-parser')

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

function createMainWindow() {
  const window = new BrowserWindow()

  if (isDevelopment) {
    window.webContents.openDevTools()
  }

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  }
  else {
    window.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }))
  }

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

function readCSV(path) {
  var results = []
  jetpack.createReadStream(path)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
  });
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
  mainWindow.setSize(1000,800);
})

if (process.platform == "linux") {
  var sep = "/"
  var rm = "rm *.xlsx"
} else {
  var sep = "\\"
  var rm = "del *.xlsx"
}

ipcMain.on('chose-dir', (event, arg) => {
  var res = dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (res !== undefined) {
    var dir = res
    var files = jetpack.list(res[0])
    var res = [];
    for (var i = 0; i < files.length; i++) {
      var fd = jetpack.inspect(dir + sep + files[i], {times : true})
      var date = new Date(fd.modifyTime);
      if(fd.name.includes(".csv")) {
        res.push({name:fd.name, date:date.toLocaleString()})
      }
    }
    var data = {dir:dir,files:res}
    event.sender.send('dir', data)
  }
})

ipcMain.on("get-CSV",(event, arg) => {
  function npv(str) { // retourne le nb de ";" dans str
    var indices = [];
    for(var i=0; i<str.length;i++) {
        if (str[i] === ";") indices.push(i);
    }
    return indices;
  }
  var stream = require('stream');
  var util = require('util');

  var Transform = stream.Transform || require('readable-stream').Transform;

  class formatCSV extends Transform  { // remplace dans le flux ";" -> "," avant l'interpretation en csv
      constructor() { super() }
      _transform (line, encoding, processed) {
        var buff = decodeURIComponent(escape(line));
        if (npv(buff).length >= 5) {
          line = Buffer.from(buff.replace(new RegExp(';', 'g'), ','), 'utf8');
        }
          this.push(line);
          processed();
      }
  }

  var table = [];

  jetpack.createReadStream(arg.dir+sep+arg.file)
  .pipe(new formatCSV())
  .pipe(csv())
  .on('data', (data) => table.push(data))
  .on('end', () => {
    var res = {file: arg.file, csv: table}
    event.sender.send('csv', res)
  });
})

ipcMain.on('save-cr', (event, arg) => {
  var res = dialog.showSaveDialog({
    title:"Sauvegarder sous:",
    buttonLabel : "Sauvegarder",
    filters: [ { name: 'Classeur', extensions: ['xlsx'] }]
  });
  if (res !== undefined) {
    jetpack.copy(arg, res, { overwrite: true });

    const {shell} = require('electron');
    shell.openItem(res);

    const cp = require('child_process')
    cp.exec(rm);
  }
})

ipcMain.on('get-settings',(event, arg) => {
  fs.readFile('settings.json', (err,data) => {
    event.sender.send('set-settings', JSON.parse(data))
  });
})

ipcMain.on('set-settings',(event, arg) => {
  const data = new Uint8Array(Buffer.from(JSON.stringify(arg)));
  fs.writeFile('settings.json', data, (err) => {
    if (err) throw err;
  });
})
