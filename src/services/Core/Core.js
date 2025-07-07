// Copyright (C) 2017-2023 Smart code 203358507

const EventEmitter = require('eventemitter3');
const CoreTransport = require('./CoreTransport');
const { TORRENTIO_ADDON } = require('stremio/common/CONSTANTS');

function Core(args) {
    let active = false;
    let error = null;
    let starting = false;
    let transport = null;

    const events = new EventEmitter();

    function onTransportInit() {
        active = true;
        error = null;
        starting = false;
        onStateChanged();

        // eslint-disable-next-line no-console
        console.log('Core transport initialized, attempting to auto-install Torrentio addon...');

        // Auto-install Torrentio addon with a delay to ensure core is fully ready
        setTimeout(async () => {
            try {
                if (transport !== null) {
                    // eslint-disable-next-line no-console
                    console.log('Checking if Torrentio addon is already installed...');
                    // Check if Torrentio is already installed
                    const ctxState = await transport.getState('ctx');
                    const installedAddons = ctxState?.content?.profile?.addons || [];
                    const isAlreadyInstalled = installedAddons.some((addon) =>
                        addon.manifest.id === TORRENTIO_ADDON.manifest.id
                    );

                    if (!isAlreadyInstalled) {
                        // eslint-disable-next-line no-console
                        console.log('Torrentio addon not found, installing...');
                        transport.dispatch({
                            action: 'Ctx',
                            args: {
                                action: 'InstallAddon',
                                args: TORRENTIO_ADDON,
                            }
                        });
                        // eslint-disable-next-line no-console
                        console.log('Auto-installed Torrentio addon successfully');
                    } else {
                        // eslint-disable-next-line no-console
                        console.log('Torrentio addon already installed');
                    }
                }
            } catch (addonError) {
                // eslint-disable-next-line no-console
                console.warn('Failed to auto-install Torrentio addon:', addonError);
                // Fallback: try to install anyway if checking failed
                try {
                    if (transport !== null) {
                        // eslint-disable-next-line no-console
                        console.log('Attempting fallback installation...');
                        transport.dispatch({
                            action: 'Ctx',
                            args: {
                                action: 'InstallAddon',
                                args: TORRENTIO_ADDON,
                            }
                        });
                        // eslint-disable-next-line no-console
                        console.log('Fallback installation completed');
                    }
                } catch (fallbackError) {
                    // eslint-disable-next-line no-console
                    console.error('Fallback installation also failed:', fallbackError);
                }
            }
        }, 2000); // 2 second delay to ensure core is fully initialized
    }
    function onTransportError(args) {
        console.error(args);
        active = false;
        error = new Error('Stremio Core Transport initialization failed', { cause: args });
        starting = false;
        onStateChanged();
        transport = null;
    }
    function onStateChanged() {
        events.emit('stateChanged');
    }

    Object.defineProperties(this, {
        active: {
            configurable: false,
            enumerable: true,
            get: function() {
                return active;
            }
        },
        error: {
            configurable: false,
            enumerable: true,
            get: function() {
                return error;
            }
        },
        starting: {
            configurable: false,
            enumerable: true,
            get: function() {
                return starting;
            }
        },
        transport: {
            configurable: false,
            enumerable: true,
            get: function() {
                return transport;
            }
        }
    });

    this.start = function() {
        if (active || error instanceof Error || starting) {
            return;
        }

        starting = true;
        transport = new CoreTransport(args);
        transport.on('init', onTransportInit);
        transport.on('error', onTransportError);
        onStateChanged();
    };
    this.stop = function() {
        active = false;
        error = null;
        starting = false;
        onStateChanged();
        if (transport !== null) {
            transport.removeAllListeners();
            transport = null;
        }
    };
    this.on = function(name, listener) {
        events.on(name, listener);
    };
    this.off = function(name, listener) {
        events.off(name, listener);
    };
    this.installAddon = function(manifest) {
        if (transport !== null) {
            transport.dispatch({
                action: 'InstallAddon',
                args: manifest
            });
        }
    };
}

module.exports = Core;
