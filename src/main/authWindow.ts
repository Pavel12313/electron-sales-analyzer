import { BrowserWindow } from 'electron';

export function createAuthWindow(authUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    win.loadURL(authUrl);

    win.webContents.on('will-redirect', (event, url) => {
      const rawCode = /code=([^&]*)/.exec(url) || null;
      const code = rawCode && rawCode.length > 1 ? decodeURIComponent(rawCode[1]) : null;
      if (code) {
        resolve(code);
        win.close();
      }
    });

    win.on('closed', () => {
      reject(new Error('User closed the window'));
    });
  });
}
