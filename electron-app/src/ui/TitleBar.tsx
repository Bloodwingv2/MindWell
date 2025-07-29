import { useState, useEffect } from 'react';
import './TitleBar.css';
import Mindwell from '../assets/MindWell.png';

declare global {
    interface Window {
        electron: {
            receive: (channel: string, callback: (...args: any[]) => void) => void;
            isMaximized: () => Promise<boolean>;
        }
    }
}

const TitleBar = () => {
    const [isWindowMaximized, setIsWindowMaximized] = useState(false);

    useEffect(() => {
        window.electron.receive('window-maximized', () => {
            setIsWindowMaximized(true);
        });

        window.electron.receive('window-unmaximized', () => {
            setIsWindowMaximized(false);
        });

        window.electron.isMaximized?.().then(maximized => {
            setIsWindowMaximized(maximized);
        });
    }, []);

    return (
        <div className={`titlebar ${isWindowMaximized ? 'maximized' : ''}`}>
            <div className="titlebar-drag-region">
                <div className="titlebar-content">
                    <img 
                        src={Mindwell} 
                        alt="MindWell Logo" 
                        className="titlebar-logo"
                        draggable={false}
                    />
                    <div className="window-title">MindWell</div>
                </div>
            </div>
        </div>
    );
};

export default TitleBar;
