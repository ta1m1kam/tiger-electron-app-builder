import { autoUpdater } from 'electron-updater'
import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// import AppUpdater from './appUpdater'

function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: false,
      nodeIntegration: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

app.setLoginItemSettings({
  openAtLogin: true
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.on('crash', () => {
    throw new Error('crash')
  })

  const win = createWindow()

  // win.webContents.openDevTools()
  win.webContents.on('render-process-gone', (event, details) => {
    console.error('Render process is gone:', details)
  })

  app.on('ready', createWindow)

  // 1秒後にクラッシュ
  // setTimeout(() => {
  //   autoUpdater.checkForUpdatesAndNotify()
  // }, 10000)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('ready', () => {
  // const autoUpdater = new AppUpdater()

  setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 10000)
})

autoUpdater.on('update-downloaded', async () => {
  const returnValue = await dialog.showMessageBox({
    message: 'アップデートあり',
    detail: '再起動してインストールできます。',
    buttons: ['再起動', '後で']
  })
  if (returnValue.response === 0) {
    autoUpdater.quitAndInstall() // アプリを終了してインストール
  }
})

// アップデートがあるとき
autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    message: 'アップデートがあります',
    buttons: ['OK']
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
  // app.exit(0)
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
process.on('uncaughtException', (error) => {
  console.error('アプリがクラッシュしました:', error)

  // 再起動ロジック
  app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
  app.exit(0)
})
