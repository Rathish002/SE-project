import React, { useEffect, useState } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

const AccessibilityOverlays: React.FC = () => {
    const { preferences } = useAccessibility();
    const [mouseY, setMouseY] = useState(0);

    useEffect(() => {
        if (preferences.readingMask) {
            const handleMouseMove = (e: MouseEvent) => {
                setMouseY(e.clientY);
            };
            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);
        }
    }, [preferences.readingMask]);

    if (!preferences.blueLightFilter && !preferences.readingMask) {
        return null;
    }

    return (
        <>
            {preferences.blueLightFilter && (
                <div id="blue-light-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(255, 165, 0, 0.2)',
                    pointerEvents: 'none',
                    zIndex: 9998,
                    mixBlendMode: 'multiply'
                }} />
            )}

            {preferences.readingMask && (
                <div id="reading-mask-container" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    pointerEvents: 'none',
                    zIndex: 9999,
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${mouseY - 40}px`,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        transition: 'height 50ms linear'
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: `${mouseY + 40}px`,
                        left: 0,
                        width: '100%',
                        height: 'calc(100vh - ' + (mouseY + 40) + 'px)',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        transition: 'top 50ms linear, height 50ms linear'
                    }} />
                </div>
            )}
        </>
    );
};

export default AccessibilityOverlays;
