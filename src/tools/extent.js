/**
 *
 * @param {Array<Array<Coordinate>>} coordinates
 */
export function calculateHole(coordinates) {
    if (coordinates.length > 2) {
        throw 'coordinates is not a hole, length shoule be 2';
    }
    const extent1 = boundingExtent(coordinates[0]);
    const extent2 = boundingExtent(coordinates[1]);
    return containsExtent(extent1, extent2) ? coordinates : [coordinates[1], coordinates[0]];
}

/**
 * Check if one extent contains another.
 *
 * An extent is deemed contained if it lies completely within the other extent,
 * including if they share one or more edges.
 *
 * @param {Extent} extent1 Extent 1.
 * @param {Extent} extent2 Extent 2.
 * @return {boolean} The second extent is contained by or on the edge of the
 *     first.
 * @api
 */
export function containsExtent(extent1, extent2) {
    return extent1[0] <= extent2[0] && extent2[2] <= extent1[2] && extent1[1] <= extent2[1] && extent2[3] <= extent1[3];
}

/**
 * Build an extent that includes all given coordinates.
 *
 * @param {Array<Coordinate>} coordinates Coordinates.
 * @return {Extent} Bounding extent.
 * @api
 */
export function boundingExtent(coordinates) {
    const extent = createEmpty();
    for (let i = 0, ii = coordinates.length; i < ii; ++i) {
        extendCoordinate(extent, coordinates[i]);
    }
    return extent;
}

/**
 * Create an empty extent.
 * @return {Extent} Empty extent.
 * @api
 */
export function createEmpty() {
    return [Infinity, Infinity, -Infinity, -Infinity];
}

/**
 * @param {Extent} extent Extent.
 * @param {Coordinate} coordinate Coordinate.
 */
export function extendCoordinate(extent, coordinate) {
    if (coordinate[0] < extent[0]) {
        extent[0] = coordinate[0];
    }
    if (coordinate[0] > extent[2]) {
        extent[2] = coordinate[0];
    }
    if (coordinate[1] < extent[1]) {
        extent[1] = coordinate[1];
    }
    if (coordinate[1] > extent[3]) {
        extent[3] = coordinate[1];
    }
}

/**
 * An array of numbers representing an xy coordinate. Example: `[16, 48]`.
 * @typedef {Array<number>} Coordinate
 * @api
 */
