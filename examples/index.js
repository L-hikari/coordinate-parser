const point = 'POINT (30 10)';
const lineString = 'LINESTRING (30 10, 10 30, 40 40)';
// const polygon = 'POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))';
const polygon = 'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10),(20 30, 35 35, 30 20, 20 30))';
const multiPoint = 'MULTIPOINT ((10 40), (40 30), (20 20), (30 10))';
// const multiPoint = 'MULTIPOINT (10 40, 40 30, 20 20, 30 10)';
const multiLineString = 'MULTILINESTRING ((10 10, 20 20, 10 40),(40 40, 30 30, 40 20, 30 10))';
// const multiLineString = 'MULTILINESTRING ((40 40, 30 30, 40 20, 30 10))';
// const multiPolygon = 'MULTIPOLYGON (((15 5, 40 10, 10 20, 5 10, 15 5)))';
const multiPolygon = 'MULTIPOLYGON (((40 40, 20 45, 45 30, 40 40)),((20 35, 10 30, 10 10, 30 5, 45 20, 20 35),(30 20, 20 15, 20 25, 30 20)))';
// const multiPolygon = 'MULTIPOLYGON (((20 35, 10 30, 10 10, 30 5, 45 20, 20 35),(30 20, 20 15, 20 25, 30 20)))';

const wktParser = new Cparser.WKT(multiLineString);
// const wktParser = new Wkt.Wkt({
//     "type": "Point", 
//     "coordinates": [30.0, 10.0]
// });


console.log(wktParser.getCoordinates_());