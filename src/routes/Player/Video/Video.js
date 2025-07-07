// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const styles = require('./styles');

const Video = React.forwardRef(({ className, onClick, onDoubleClick }, ref) => {
    const videoRef = React.useRef(null);
    const playerRef = React.useRef(null);

    // Initialize Video.js player only if needed
    React.useEffect(() => {
        // Check if we should use Video.js or the default Stremio player
        const shouldUseVideoJS = window.location.search.includes('videojs=true');
        
        if (shouldUseVideoJS && videoRef.current && !playerRef.current) {
            // Dynamically import Video.js to avoid breaking the app
            import('video.js').then((videojs) => {
                if (videoRef.current && !playerRef.current) {
                    playerRef.current = videojs.default(videoRef.current, {
                        controls: true,
                        fluid: true,
                        responsive: true,
                        playbackRates: [0.5, 1, 1.25, 1.5, 2]
                    });

                    console.log('Video.js player initialized');
                }
            }).catch((error) => {
                console.error('Failed to load Video.js:', error);
            });
        }

        return () => {
            if (playerRef.current) {
                try {
                    playerRef.current.dispose();
                    playerRef.current = null;
                } catch (error) {
                    console.error('Error disposing Video.js player:', error);
                }
            }
        };
    }, []);

    return (
        <div className={classnames(className, styles['video-container'])} onClick={onClick} onDoubleClick={onDoubleClick}>
            {/* Use Video.js only if specifically requested */}
            {window.location.search.includes('videojs=true') ? (
                <div data-vjs-player>
                    <video
                        ref={videoRef}
                        className={classnames(styles['video'], 'video-js', 'vjs-default-skin')}
                        preload="auto"
                        data-setup="{}"
                    />
                </div>
            ) : (
                <div ref={ref} className={styles['video']} />
            )}
        </div>
    );
});

Video.displayName = 'Video';

Video.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func,
};

module.exports = Video;
