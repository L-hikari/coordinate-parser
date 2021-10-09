import ingest from '../tools/ingest';
import parser from '../tools/parser';
import regExes from '../tools/regExes';

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

        return parser[this.type](components);
    }
}

export default WKT;
