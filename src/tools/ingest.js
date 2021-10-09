import regExes from './regExes';

function stripWhitespaceAndParens_(fullStr) {
    var trimmed = fullStr.trim();
    var noParens = trimmed.replace(/^\(?(.*?)\)?$/, '$1');
    return noParens;
}

export default {
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
