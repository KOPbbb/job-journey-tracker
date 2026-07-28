const { app, BrowserWindow, shell } = require('electron')
const path = require('node:path')

const APP_ID = 'com.jobjourney.tracker'
const DATA_DIRECTORY = 'job-journey-tracker'

// Keep these values stable across releases. They make installer updates reopen the
// same local profile instead of creating a new, empty data directory.
app.setName(DATA_DIRECTORY)
app.setAppUserModelId(APP_ID)
app.setPath('userData', path.join(app.getPath('appData'), DATA_DIRECTORY))

function isExternalUrl(url) {
  return url.startsWith('https://') || url.startsWith('http://')
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1060,
    minHeight: 720,
    show: false,
    backgroundColor: '#ffffff',
    title: '求职轨迹',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (isExternalUrl(url)) shell.openExternal(url)
    return { action: 'deny' }
  })

  window.webContents.on('will-navigate', (event, url) => {
    if (isExternalUrl(url)) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  window.once('ready-to-show', () => window.show())
  window.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
