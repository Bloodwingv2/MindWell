import { useState, useEffect } from 'react';
import './TitleBar.css';
import Mindwell from '../assets/MindWell.png';

declare global {
    interface Window {
        electron: {
            windowControls: {
                minimize: () => Promise<void>;
                maximize: () => Promise<void>;
                close: () => Promise<void>;
            };
            receive: (channel: string, callback: (...args: any[]) => void) => void;
            isMaximized: () => Promise<boolean>;
        }
    }
}

const TitleBar = () => {
    const [isMinimizing, setIsMinimizing] = useState(false);
    const [isMaximizing, setIsMaximizing] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isWindowMaximized, setIsWindowMaximized] = useState(false);

    useEffect(() => {
        // Listen for window state changes
        window.electron.receive('window-maximized', () => {
            setIsWindowMaximized(true);
        });

        window.electron.receive('window-unmaximized', () => {
            setIsWindowMaximized(false);
        });

        // Animation events
        window.electron.receive('window-will-minimize', () => {
            setIsMinimizing(true);
            setTimeout(() => setIsMinimizing(false), 300);
        });

        window.electron.receive('window-will-maximize', () => {
            setIsMaximizing(true);
            setTimeout(() => setIsMaximizing(false), 300);
        });

        window.electron.receive('window-will-close', () => {
            setIsClosing(true);
        });

        // Check initial window state
        window.electron.isMaximized?.().then(maximized => {
            setIsWindowMaximized(maximized);
        });
    }, []);

    return (
        <div className={`titlebar ${isClosing ? 'closing' : ''} ${isWindowMaximized ? 'maximized' : ''}`}>
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
            <div className="window-controls">
                <button 
                    className={`window-control minimize ${isMinimizing ? 'minimizing' : ''}`}
                    onClick={() => window.electron.windowControls.minimize()}
                    title="Minimize"
                >
                    <svg width="12" height="12" viewBox="0 0 12 12"><rect fill="currentColor" width="10" height="1" x="1" y="6"></rect></svg>
                </button>
                <button 
                    className={`window-control maximize ${isMaximizing ? 'maximizing' : ''}`}
                    onClick={() => window.electron.windowControls.maximize()}
                    title={isWindowMaximized ? 'Restore' : 'Maximize'}
                >
                    {isWindowMaximized ? (
                        <svg width="12" height="12" viewBox="0 0 12 12">
                            <path fill="none" stroke="currentColor" d="M3.5,4.5v-2h5v5h-2 M3.5,4.5v5h5v-5z"/>
                        </svg>
                    ) : (
                        <svg width="12" height="12" viewBox="0 0 12 12">
                            <rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="currentColor"/>
                        </svg>
                    )}
                </button>
                <button 
                    className={`window-control close ${isClosing ? 'closing' : ''}`}
                    onClick={() => window.electron.windowControls.close()}
                    title="Close"
                >
                    <svg width="12" height="12" viewBox="0 0 12 12">
                        <path stroke="currentColor" strokeWidth="1" d="M8.5,3.5 L3.5,8.5 M3.5,3.5 L8.5,8.5"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default TitleBar;