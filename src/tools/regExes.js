export default {
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
