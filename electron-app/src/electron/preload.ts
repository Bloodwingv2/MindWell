import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    receive: (channel: string, callback: (...args: any[]) => void) => {
        const validChannels = [
            'window-maximized',
            'window-unmaximized'
        ];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (_event, ...args) => callback(...args));
        }
    },
    isMaximized: () => ipcRenderer.invoke('is-maximized')
});
