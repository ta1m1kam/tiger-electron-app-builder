import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { version } from '../../../package.json'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  const ipcCrash = (): void => window.electron.ipcRenderer.send('crash')
  const ipcRendererCrash = window.electron.ipcRenderer.on('exit-process', () => {
    console.log('Exiting Renderer process')
    process.exit(0)
  })

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <h1>{version}</h1>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
        <button onClick={ipcCrash}>crash</button>
        <button onClick={ipcRendererCrash}>ipcRendererCrash</button>
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
