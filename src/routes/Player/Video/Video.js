// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const styles = require('./styles');

// Import Video.js statically to ensure it's available
let videojs = null;
try {
    videojs = require('video.js');
    require('videojs-contrib-hls');
    require('@videojs/http-streaming');
} catch (error) {
    console.warn('Video.js not available:', error);
}

const Video = React.forwardRef(({ className, onClick, onDoubleClick, videoState }, ref) => {
    const videoRef = React.useRef(null);
    const playerRef = React.useRef(null);
    const containerRef = React.useRef(null);
    const [videojsReady, setVideojsReady] = React.useState(false);
    const [streamUrl, setStreamUrl] = React.useState(null);

    // Check if we should use Video.js
    const shouldUseVideoJS = React.useMemo(() => {
        return window.location.search.includes('videojs=true') && videojs;
    }, []);

    // Monitor video state changes for stream URLs
    React.useEffect(() => {
        if (!shouldUseVideoJS || !videojsReady || !playerRef.current) return;

        // Check if video state has a stream with a URL
        if (videoState && videoState.stream && videoState.stream.url) {
            const newStreamUrl = videoState.stream.url;
            console.log('🔗 Stream URL detected from video state:', newStreamUrl);
            
            if (newStreamUrl !== streamUrl) {
                setStreamUrl(newStreamUrl);
                
                // Determine stream type and load into Video.js
                let streamType = 'video/mp4'; // Default
                if (newStreamUrl.includes('.m3u8') || newStreamUrl.includes('hls')) {
                    streamType = 'application/x-mpegURL';
                } else if (newStreamUrl.includes('.mpd')) {
                    streamType = 'application/dash+xml';
                }
                
                console.log('📡 Loading stream type:', streamType);
                playerRef.current.src({
                    type: streamType,
                    src: newStreamUrl
                });
                
                // Try to play the video
                setTimeout(() => {
                    if (playerRef.current) {
                        playerRef.current.play().catch(e => {
                            console.warn('Autoplay failed:', e);
                        });
                    }
                }, 100);
            }
        }
    }, [shouldUseVideoJS, videojsReady, videoState, streamUrl]);

    // Initialize Video.js player
    React.useEffect(() => {
        if (shouldUseVideoJS && videoRef.current && !playerRef.current && videojs) {
            try {
                console.log('🎬 Initializing Video.js player...');
                
                playerRef.current = videojs(videoRef.current, {
                    controls: true,
                    fluid: true,
                    responsive: true,
                    playbackRates: [0.5, 1, 1.25, 1.5, 2],
                    html5: {
                        hls: {
                            enableLowInitialPlaylist: true,
                            smoothQualityChange: true,
                            overrideNative: true
                        }
                    },
                    techOrder: ['html5'],
                    preload: 'auto'
                });

                playerRef.current.ready(() => {
                    setVideojsReady(true);
                    console.log('🎥 Video.js player initialized successfully');
                    console.log('📍 Player ready with controls:', playerRef.current.controls());
                    
                    // Add event listeners for Video.js events
                    playerRef.current.on('loadstart', () => {
                        console.log('📡 Video.js: Loading started');
                    });
                    
                    playerRef.current.on('loadedmetadata', () => {
                        console.log('📋 Video.js: Metadata loaded');
                    });
                    
                    playerRef.current.on('canplay', () => {
                        console.log('▶️ Video.js: Can start playing');
                    });
                    
                    playerRef.current.on('playing', () => {
                        console.log('🎮 Video.js: Started playing');
                    });
                    
                    playerRef.current.on('waiting', () => {
                        console.log('⏳ Video.js: Waiting for data');
                    });
                    
                    playerRef.current.on('error', (e) => {
                        console.error('❌ Video.js error:', e);
                        const error = playerRef.current.error();
                        if (error) {
                            console.error('Error details:', error.code, error.message);
                        }
                    });
                    
                    // Add a test video source for demonstration only
                    if (window.location.search.includes('demo=true')) {
                        console.log('🐰 Loading demo video...');
                        playerRef.current.src({
                            type: 'video/mp4',
                            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
                        });
                        console.log('🐰 Demo video loaded: Big Buck Bunny');
                    }
                });

                playerRef.current.on('error', (error) => {
                    console.error('Video.js player error:', error);
                });

            } catch (error) {
                console.error('Failed to initialize Video.js:', error);
            }
        }

        return () => {
            if (playerRef.current) {
                try {
                    console.log('🧹 Cleaning up Video.js player...');
                    playerRef.current.dispose();
                    playerRef.current = null;
                    setVideojsReady(false);
                } catch (error) {
                    console.error('Error disposing Video.js player:', error);
                }
            }
        };
    }, [shouldUseVideoJS]);

    // Forward the appropriate ref to parent
    React.useEffect(() => {
        if (ref) {
            if (typeof ref === 'function') {
                ref(shouldUseVideoJS ? playerRef.current : containerRef.current);
            } else {
                ref.current = shouldUseVideoJS ? playerRef.current : containerRef.current;
            }
        }
    }, [ref, shouldUseVideoJS, videojsReady]);

    return (
        <div className={classnames(className, styles['video-container'])} onClick={onClick} onDoubleClick={onDoubleClick}>
            {shouldUseVideoJS ? (
                <>
                    {/* Video.js Player */}
                    <div data-vjs-player style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <video
                            ref={videoRef}
                            className={classnames(styles['video'], 'video-js', 'vjs-default-skin')}
                            preload="auto"
                            data-setup="{}"
                            style={{ width: '100%', height: '100%' }}
                        />
                        {videojsReady && (
                            <div style={{ 
                                position: 'absolute', 
                                top: '10px', 
                                left: '10px', 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                                color: 'white', 
                                padding: '8px 16px', 
                                borderRadius: '20px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                zIndex: 1000,
                                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                border: '2px solid rgba(255,255,255,0.2)'
                            }}>
                                🎥 Video.js Active {streamUrl && '• Stream Connected'}
                            </div>
                        )}
                    </div>
                    {/* Hidden container for Stremio's video system - still needed for ref forwarding */}
                    <div 
                        ref={containerRef} 
                        style={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: '100%', 
                            height: '100%', 
                            opacity: 0, 
                            pointerEvents: 'none',
                            zIndex: -1
                        }} 
                    />
                </>
            ) : (
                <div ref={containerRef} className={styles['video']} />
            )}
        </div>
    );
});

Video.displayName = 'Video';

Video.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func,
    videoState: PropTypes.object,
};

module.exports = Video;
