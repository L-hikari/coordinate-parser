function stripWhitespaceAndParens_(fullStr) {
    var trimmed = fullStr.trim();
    var noParens = trimmed.replace(/^\(?(.*?)\)?$/, '$1');
    return noParens;
}

function fromJson(obj) {
    var i, j, k, coords, iring, oring;

    // this.type = obj.type.toLowerCase();
    let components = [];
    if (obj.hasOwnProperty('geometry')) {
        //Feature
        fromJson(obj.geometry);
        return this;
    }
    coords = obj.coordinates;

    for (i in coords) {
        if (coords.hasOwnProperty(i)) {
            if (!Wkt.isArray(coords[i][0])) {
                // LineString
                components.push(coords[i]);
            } else {
                oring = [];
                for (j in coords[i]) {
                    if (coords[i].hasOwnProperty(j)) {
                        // Polygon
                        if (!Wkt.isArray(coords[i][j][0])) {
                            if (coords.length > 1) {
                                oring.push(coords[i][j]);
                            } else {
                                components.push(coords[i][j]);
                            }
                        } else {
                            // MultiPolygon
                            iring = [];
                            for (k in coords[i][j]) {
                                if (coords[i][j].hasOwnProperty(k)) {
                                    if (coords.length > 1) {
                                        iring.push(coords[i][j][k]);
                                    } else {
                                        if (coords[i].length > 1) {
                                            iring.push(coords[i][j][k]);
                                        } else {
                                            components.push(coords[i][j][k]);
                                        }
                                    }
                                }
                            }

                            coords[i].length > 1 ? oring.push(iring) : (oring = oring.concat(iring));
                        }
                    }
                }

                if (coords.length > 1) {
                    if (obj.type === 'multilinestring') {
                        components.push({
                            type: 'linestring',
                            coordinates: oring
                        });
                    } else {
                        components.push(oring);
                    }
                } else if (coords[i].length > 1) {
                    if (obj.type === 'multilinestring') {
                        return {
                            type: 'linestring',
                            coordinates: components
                        };
                    } else {
                        return {
                            type: 'polygon',
                            coordinates: components
                        };
                    }
                }
            }
        }
    }

    return components;
}

const regExes = {
    typeStr: /^\s*(\w+)\s*\(\s*(.*)\s*\)\s*$/,
    spaces: /\s+|\+/, // Matches the '+' or the empty space
    numeric: /-*\d+(\.*\d+)?/,
    comma: /\s*,\s*/,
    parenComma: /\)\s*,\s*\(/,
    coord: /-*\d+\.*\d+ -*\d+\.*\d+/, // e.g. "24 -14"
    doubleParenComma: /\)\s*\)\s*,\s*\(\s*\(/,
    ogcTypes: /^(multi)?(point|line|polygon|box)?(string)?$/i, // Captures e.g. "Multi","Line","String"
    crudeJson: /^{.*"(type|coordinates|geometries|features)":.*}$/, // Attempts to recognize JSON strings
};

const ingest = {
    /**
     * Return point feature given a point WKT fragment.
     * @param   str {String}    A WKT fragment representing the point
     */
    point: function (str) {
        var coords = str.trim().split(regExes.spaces);
        // In case a parenthetical group of coordinates is passed...
        return [
            [
                // ...Search for numeric substrings
                parseFloat(regExes.numeric.exec(coords[0])[0]),
                parseFloat(regExes.numeric.exec(coords[1])[0]),
            ],
        ];
    },

    /**
     * Return a multipoint feature given a multipoint WKT fragment.
     * @param   str {String}    A WKT fragment representing the multipoint
     */
    multipoint: function (str) {
        var i, components, points;
        components = [];
        points = str.trim().split(regExes.comma);
        for (i = 0; i < points.length; i += 1) {
            components.push(...this.point(points[i]));
        }
        return components;
    },

    /**
     * Return a linestring feature given a linestring WKT fragment.
     * @param   str {String}    A WKT fragment representing the linestring
     */
    linestring: function (str) {
        var i, multipoints, components;

        // In our x-and-y representation of components, parsing
        //  multipoints is the same as parsing linestrings
        multipoints = this.multipoint(str);

        // However, the points need to be joined
        components = [];
        for (i = 0; i < multipoints.length; i += 1) {
            components.push(multipoints[i]);
        }
        return components;
    },

    /**
     * Return a multilinestring feature given a multilinestring WKT fragment.
     * @param   str {String}    A WKT fragment representing the multilinestring
     */
    multilinestring: function (str) {
        var i, components, line, lines;
        components = [];

        lines = str.trim().split(regExes.doubleParenComma);
        if (lines.length === 1) {
            // If that didn't work...
            lines = str.trim().split(regExes.parenComma);
        }

        for (i = 0; i < lines.length; i += 1) {
            line = stripWhitespaceAndParens_(lines[i]);
            components.push(this.linestring(line));
        }

        return components;
    },

    /**
     * Return a polygon feature given a polygon WKT fragment.
     * @param   str {String}    A WKT fragment representing the polygon
     */
    polygon: function (str) {
        var i, j, components, subcomponents, ring, rings;
        rings = str.trim().split(regExes.parenComma);
        components = []; // Holds one or more rings
        for (i = 0; i < rings.length; i += 1) {
            ring = stripWhitespaceAndParens_(rings[i]).split(regExes.comma);
            subcomponents = []; // Holds the outer ring and any inner rings (holes)
            for (j = 0; j < ring.length; j += 1) {
                // Split on the empty space or '+' character (between coordinates)
                var split = ring[j].split(regExes.spaces);
                if (split.length > 2) {
                    //remove the elements which are blanks
                    split = split.filter(function (n) {
                        return n != '';
                    });
                }
                if (split.length === 2) {
                    var x_cord = split[0];
                    var y_cord = split[1];

                    //now push
                    subcomponents.push([parseFloat(x_cord), parseFloat(y_cord)]);
                }
            }
            components.push(subcomponents);
        }
        return components;
    },

    /**
     * Return box vertices (which would become the Rectangle bounds) given a Box WKT fragment.
     * @param   str {String}    A WKT fragment representing the box
     */
    box: function (str) {
        var i, multipoints, components;

        // In our x-and-y representation of components, parsing
        //  multipoints is the same as parsing linestrings
        multipoints = this.multipoint(str);

        // However, the points need to be joined
        components = [];
        for (i = 0; i < multipoints.length; i += 1) {
            components = components.concat(multipoints[i]);
        }

        return components;
    },

    /**
     * Return a multipolygon feature given a multipolygon WKT fragment.
     * @param   str {String}    A WKT fragment representing the multipolygon
     */
    multipolygon: function (str) {
        var i, components, polygon, polygons;
        components = [];
        polygons = str.trim().split(regExes.doubleParenComma);
        for (i = 0; i < polygons.length; i += 1) {
            polygon = stripWhitespaceAndParens_(polygons[i]);
            components.push(this.polygon(polygon));
        }
        return components;
    },

    /**
     * Return an array of features given a geometrycollection WKT fragment.
     * @param   str {String}    A WKT fragment representing the geometry collection
     */
    geometrycollection: function (str) {
        console.log('The geometrycollection WKT type is not yet supported.');
    },
}; // eo ingest

const parser = {
    /**
     * point
     * @param {Array} coordinates 
     * @returns 
     */
    point(coordinates) {
        return {
            type: 'Point',
            coordinates
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
            children: coordinates.map(item => this.point(item))
        }
    },
    /**
     * linestring
     * @param {Array} coordinates 
     */
    linestring(coordinates) {
        return {
            type: 'LineString',
            coordinates
        }
    },
    /**
     * multilinestring
     * @param {Array} coordinates 
     */
    multilinestring(coordinates) {
        return {
            type: 'MultiLineString',
            children: coordinates.map(item => this.linestring(item))
        }
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
                coordinates
            }
        }
        return {
            type: 'Polygon',
            isHole: false,
            coordinates: coordinates[0]
        }
    }
}

/**
 * @classdesc
 * Geometry format for reading and writing data in the `WellKnownText` (WKT)
 * format.
 *
 * @api
 */
class WKT {
    /**
     * @param {string} wkt WKT string.
     */
    constructor(wkt, delimiter) {
        /**
         * The default delimiter between X and Y coordinates.
         * @ignore
         */
        this.delimiter = delimiter || ' ';

        /**
         * Configuration parameter for controlling how Wicket seralizes
         * MULTIPOINT strings. Examples; both are valid WKT:
         * If true: MULTIPOINT((30 10),(10 30),(40 40))
         * If false: MULTIPOINT(30 10,10 30,40 40)
         * @ignore
         */
        this.wrapVertices = true;

        /**
         * geometry type
         * @type {string}
         */
        this.type;

        /**
         * The internal representation of geometry--the "components" of geometry.
         * @ignore
         */
        this.components = [];

        // An initial WKT string may be provided
        if (wkt && typeof wkt === 'string') {
            this.read_(wkt);
        } else {
            throw {
                name: 'WKTError',
                message: 'Invalid WKT string provided to read()',
            };
        }
    }

    /**
     * Reads a WKT string, validating and incorporating it.
     * @param   wkt {String}    A WKT string
     * @return	{this.Wkt.Wkt}	The object itself
     * @memberof this.Wkt.Wkt
     * @method
     * @private
     */
    read_(wkt) {
        var matches;
        matches = regExes.typeStr.exec(wkt);
        if (matches) {
            this.type = matches[1].toLowerCase();
            this.base = matches[2];
            if (ingest[this.type]) {
                this.components = ingest[this.type](this.base);
            }
        } else {
            console.log('Invalid WKT string provided to read()');
            throw {
                name: 'WKTError',
                message: 'Invalid WKT string provided to read()',
            };
        }

        return this;
    } // eo readWkt

    /**
     * get parsered coordinates
     * @param components {Array}
     * @returns {Array<Array>}
     */
    getCoordinates_(components) {

        components = components || this.components;


        if (this.type === 'point') {
            return {
                type: this.type,
                coordinates: components[0]
            };
        }
        console.log(components);

        return parser[this.type](components);
        // let coordinates = fromJson({
        //     type: this.type,
        //     coordinates: components
        // });

        // if (this.type.slice(0, 5) === 'multi') {
        //     return {
        //         type: this.type,
        //         children: coordinates
        //     }
        // }

        // return {
        //     type: this.type,
        //     coordinates
        // };
    }
}

export default WKT;
