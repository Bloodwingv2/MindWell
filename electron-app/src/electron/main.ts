import { isDev } from "./util";
import { execFile } from "child_process";
import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import treeKill from 'tree-kill';

let backendprocess : ReturnType<typeof execFile> | null = null;

function WindowSettings() {
    const mainWindow = new BrowserWindow({
        frame: false,
        transparent: true,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Window control handlers with animations
    ipcMain.handle('minimize-window', () => {
        mainWindow.webContents.send('window-will-minimize');
        setTimeout(() => {
            mainWindow.minimize();
        }, 200);
    });

    ipcMain.handle('maximize-window', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.webContents.send('window-will-restore');
            setTimeout(() => {
                mainWindow.restore();
            }, 200);
        } else {
            mainWindow.webContents.send('window-will-maximize');
            setTimeout(() => {
                mainWindow.maximize();
            }, 200);
        }
    });

    ipcMain.handle('close-window', () => {
        mainWindow.webContents.send('window-will-close');
        setTimeout(() => {
            mainWindow.close();
        }, 200);
    });

    // Window state tracking
    ipcMain.handle('is-maximized', () => {
        return mainWindow.isMaximized();
    });

    // Enhanced window state events
    mainWindow.on('maximize', () => {
        mainWindow.webContents.send('window-maximized');
    });

    mainWindow.on('unmaximize', () => {
        mainWindow.webContents.send('window-unmaximized');
    });

    mainWindow.on('minimize', () => {
        mainWindow.webContents.send('window-minimized');
    });

    mainWindow.on('restore', () => {
        mainWindow.webContents.send('window-restored');
    });

    // Double-click titlebar to maximize/restore
    ipcMain.handle('titlebar-doubleclick', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.restore();
        } else {
            mainWindow.maximize();
        }
    });

    mainWindow.maximize();
    mainWindow.show();

      
        if (isDev()) {
            mainWindow.loadURL('http://localhost:5123');
        } else {
            mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
        }
        
}

app.on('ready', () => 
{
    // Get the correct path in both dev and production
    const batPath = isDev() 
        ? path.join(process.cwd(), 'src', 'Binaries', 'backend.bat')
        : path.join(path.dirname(app.getPath('exe')), 'resources', 'Binaries', 'backend.bat');

    backendprocess = execFile(batPath, (error, stdout, stderr) => {
        if (error) {
            console.error('Error executing batch file:', error);
            return;
        }
        console.log('Batch output:', stdout);
        if (stderr) console.error("Batch stderr:", stderr);
    });

        WindowSettings();
});

app.on('before-quit', async (event) => {
    if(backendprocess && backendprocess.pid) {
        event.preventDefault(); // Prevent quit until cleanup is done
        
        console.log('Killing Tree...');
        treeKill(backendprocess.pid);
        
        // Get the correct path in both dev and production
        const batPath = isDev()
            ? path.join(process.cwd(), 'src', 'Binaries', 'KillBackground.bat')
            : path.join(path.dirname(app.getPath('exe')), 'resources', 'Binaries', 'KillBackground.bat');
        
        try {
            await new Promise<void>((resolve, reject) => {
                // Set a timeout to prevent hanging (3 seconds for seamless experience)
                const timeout = setTimeout(() => {
                    reject(new Error('Batch file execution timeout'));
                }, 3000);
                
                execFile(batPath, (error, stdout, stderr) => {
                    clearTimeout(timeout);
                    
                    if (error) {
                        console.error('Error executing batch file:', error);
                        reject(error);
                    } else {
                        console.log('Batch output:', stdout);
                        if (stderr) console.error("Batch stderr:", stderr);
                        resolve();
                    }
                });
            });
            
            console.log('Cleanup completed successfully');
        } catch (error) {
            console.error('Cleanup failed:', error);
            // Continue with quit even if cleanup fails for seamless experience
        } finally {
            // Always quit after cleanup attempt - seamless experience
            app.exit(0);
        }
    }
});