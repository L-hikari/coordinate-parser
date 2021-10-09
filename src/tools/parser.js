import { calculateHole } from '../tools/extent';

export default {
    /**
     * point
     * @param {Array} coordinates
     * @returns
     */
    point(coordinates) {
        return {
            type: 'Point',
            coordinates,
        };
    },
    /**
     * multipoint
     * @param {Array} coordinates
     * @returns
     */
    multipoint(coordinates) {
        return {
            type: 'MultiPoint',
            children: coordinates.map((item) => this.point(item)),
        };
    },
    /**
     * linestring
     * @param {Array} coordinates
     */
    linestring(coordinates) {
        return {
            type: 'LineString',
            coordinates,
        };
    },
    /**
     * multilinestring
     * @param {Array} coordinates
     */
    multilinestring(coordinates) {
        return {
            type: 'MultiLineString',
            children: coordinates.map((item) => this.linestring(item)),
        };
    },
    /**
     *
     * @param {Array} coordinates
     */
    polygon(coordinates) {
        if (coordinates.length > 1) {
            return {
                type: 'Polygon',
                isHole: true,
                coordinates: calculateHole(coordinates),
            };
        }
        return {
            type: 'Polygon',
            isHole: false,
            coordinates: coordinates[0],
        };
    },
    multipolygon(coordinates) {
        return {
            type: 'MultiPolygon',
            children: coordinates.map((item) => this.polygon(item)),
        };
    },
};
