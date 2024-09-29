import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { BrowserWindow } from 'electron';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

let oAuth2Client: OAuth2Client | null = null;

export async function getAuthenticatedClient(): Promise<OAuth2Client> {
  if (oAuth2Client) {
    return oAuth2Client;
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  try {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    oAuth2Client.setCredentials(token);
  } catch (error) {
    await getNewToken(oAuth2Client);
  }

  return oAuth2Client;
}

async function getNewToken(oAuth2Client: OAuth2Client): Promise<void> {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  const code = await new Promise<string>((resolve, reject) => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    win.loadURL(authUrl);

    win.webContents.on('will-redirect', handleRedirect);
    win.webContents.on('did-redirect-navigation', handleRedirect);

    function handleRedirect(event: Electron.Event, url: string) {
      const rawCode = /code=([^&]*)/.exec(url);
      const code = rawCode && rawCode.length > 1 ? decodeURIComponent(rawCode[1]) : null;
      if (code) {
        resolve(code);
        setImmediate(() => win.close());
      }
    }

    win.on('closed', () => {
      reject(new Error('User closed the window'));
    });
  });

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  } catch (error) {
    console.error('Error retrieving access token', error);
    throw error;
  }
}
