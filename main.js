/**
 * 직업 ε바리스타3 - Electron 메인 프로세스 (직업 마1스톤에서 가져옴)
 *  - app:// 프로토콜로 로컬 파일을 제공(ES 모듈·fetch 가 file:// 제약 없이 동작)
 *  - F11 전체 화면, 단일 실행
 */

const { app, BrowserWindow, ipcMain, protocol, net, Menu } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } },
]);

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 760,
    minWidth: 960,
    minHeight: 560,
    title: '직업 ε바리스타3', // js/config.js 의 TITLE 과 같게
    // 앱 아이콘은 새 게임 그림이 생기면 assets/icon.png(창)과 build/icon.ico(설치 파일)로 넣고 icon 을 다시 적습니다
    backgroundColor: '#0E0C12',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      autoplayPolicy: 'no-user-gesture-required', // 앱을 켜면 오프닝 음악·표지 읽기가 바로(브라우저처럼 첫 누름을 기다리지 않음)
    },
  });
  Menu.setApplicationMenu(null);
  mainWindow.loadURL('app://game/index.html');
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      event.preventDefault();
    }
  });
  // 외부 링크는 앱 안에서 열지 않음
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
}

app.whenReady().then(() => {
  const root = path.resolve(__dirname);
  protocol.handle('app', (request) => {
    const { pathname } = new URL(request.url);
    const file = path.normalize(path.join(root, decodeURIComponent(pathname)));
    if (!file.startsWith(root)) return new Response('forbidden', { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('toggle-fullscreen', () => {
  if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
});
