import { MacUpdater } from 'electron-updater'
// Or MacUpdater, AppImageUpdater

// 使ってない
export default class AppUpdater {
  constructor() {
    const autoUpdater = new MacUpdater({
      provider: 's3',
      bucket: 'tiger-electron-app',
      region: 'ap-northeast-1',
      acl: 'public-read',
      storageClass: 'STANDARD',
      path: '/',
      endpoint: 'http://localhost:9001'
    })

    return autoUpdater
    // autoUpdater.checkForUpdatesAndNotify()
  }
}
