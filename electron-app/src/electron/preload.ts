import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    windowControls: {
        minimize: () => ipcRenderer.invoke('minimize-window'),
        maximize: () => ipcRenderer.invoke('maximize-window'),
        close: () => ipcRenderer.invoke('close-window'),
        titlebarDoubleClick: () => ipcRenderer.invoke('titlebar-doubleclick')
    },
    receive: (channel: string, callback: (...args: any[]) => void) => {
        const validChannels = [
            'window-will-minimize',
            'window-will-maximize',
            'window-will-restore',
            'window-will-close',
            'window-maximized',
            'window-unmaximized',
            'window-minimized',
            'window-restored'
        ];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (_event, ...args) => callback(...args));
        }
    },
    isMaximized: () => ipcRenderer.invoke('is-maximized')
});