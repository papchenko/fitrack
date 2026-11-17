
export const hideMapLabelsForCapture = (map) => {
    if (!map) {
        return () => {};
    }

    const layers = map.getStyle()?.layers || [];
    const changedLayers = [];

    for (const layer of layers) {
        if (layer.type !== "symbol") continue;

        const layerId = layer.id;

        const previousVisibility =
            map.getLayoutProperty(layerId, "visibility");

        if (previousVisibility === "none") continue;

        changedLayers.push({
            id: layerId,
            visibility: previousVisibility,
        });

        map.setLayoutProperty(
            layerId,
            "visibility",
            "none"
        );
    }

    // Restore all changed layers after the screenshot.
    return () => {
        for (const layer of changedLayers) {
            if (!map.getLayer(layer.id)) continue;

            map.setLayoutProperty(
                layer.id,
                "visibility",
                layer.visibility ?? "visible"
            );
        }
    };
};
