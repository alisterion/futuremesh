"use strict";
var ViewRendererPlugin;

/**
 * The view renderer plug-in is used to render the main view and minimap.
 */
ViewRendererPlugin = function () {
    var view, map, x, y, borderOffset, viewWidth, viewHeight, viewLayerSize,
            minX, minY, maxX, maxY;

    // public API

    this.handleTick = function () {
        view.display(x, y);
    };

    this.ignoresExtraTicks = function () {
        return true;
    };

    this.handleEvent = function (name, data) {
        switch (name) {
            case 'viewInitialization':
                onViewInitialization(data);
                break;
            case 'gameMapInitialization':
                onGameMapInitialization(data);
                break;
            case 'viewSetByMinimap':
                onViewSetByMinimap(data);
                break;
        }
    };

    this.getObservedEvents = function () {
        return [
            'viewInitialization',
            'gameMapInitialization',
            'viewSetByMinimap'
        ];
    };

    // private API

    /**
     * Event listener for the <code>viewSetByMinimap</code> event. The view
     * will be shifter according to the data received from the minimap: a
     * position of the user's click on the minimap scaled to the interval 0.0
     * to 1.0.
     *
     * @param {Object} data Event data, an object with the <code>x</code> and
     *        <code>y</code> fields representing the position of the user's
     *        click on the minimap.
     */
    function onViewSetByMinimap(data) {
        x = Math.floor(viewLayerSize.width * data.x - viewWidth / 2);
        y = Math.floor(viewLayerSize.height * data.y - viewHeight / 2);
        x = Math.min(maxX, Math.max(x, minX));
        y = Math.min(maxY, Math.max(y, minY));
    }

    /**
     * Event listener for the <code>gameMapInitialization</code> event. The map
     * is not set to the view until the <code>viewInitialization</code> is
     * received.
     *
     * @param {Map} data The game map.
     */
    function onGameMapInitialization(data) {
        map = data;
        if (view) {
            view.setMap(map);
        }
    }

    /**
     * Event listener for the <code>viewInitialization</code> event. The
     * listener initializes the view renderers, but does not render anything.
     *
     * @param {Object} data Event data - an object containing the main view
     *        canvas and the minimap container.
     */
    function onViewInitialization(data) {
        var minimapSize, viewWidthInTiles, viewHeightInTiles;
        view = new View();
        view.setCanvas(data.view);
        view.setMinimapContainer(data.minimap);
        minimapSize = Settings.pluginConfiguration.ViewRendererPlugin.minimap;
        view.setMinimapSize(minimapSize.width, minimapSize.height);
        if (map) {
            view.setMap(map);
        }
        viewWidth = data.view.width;
        viewHeight = data.view.height;
        viewWidthInTiles = Math.round(viewWidth / Settings.tileWidth);
        viewHeightInTiles = Math.round(viewHeight / Settings.tileHeight);
        view.setMainViewSize(viewWidthInTiles, viewHeightInTiles);
        viewLayerSize = view.getMainViewLayersDimensions();
        maxX = viewLayerSize.width - viewWidth - borderOffset;
        maxY = viewLayerSize.height - viewHeight - borderOffset;
    }

    /**
     * Constructor.
     *
     * @param {Object} pluginSettings Configuration of this plug-in.
     */
    (function (pluginSettings) {
        borderOffset = pluginSettings.borderOffset;
        x = borderOffset;
        y = borderOffset;
        minX = borderOffset;
        minY = borderOffset;
    }(Settings.pluginConfiguration.ViewRendererPlugin));
};
ViewRendererPlugin.prototype = new MixedPlugin();
