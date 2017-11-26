// main.js

// ## Resources
// - [d3-tile](https://github.com/d3/d3-tile)
// - [d3-zoom](https://github.com/d3/d3-zoom)
// - [d3-geo](https://github.com/d3/d3-geo)

console.log("hello from the main.js!")

//width and height
var width = Math.max(960, window.innerWidth),
	height = Math.max(500, window.innerHeight);

// pi and tau
var pi = Math.PI,
	tau = 2 * pi;

// setup projection mercator
//d3.geoMercator
var projection = d3.geoMercator()
	.scale(1 / tau)
	.translate([0, 0]);

// d3 path
var path = d3.geoPath()
	.projection(projection);

// d3 tile
var tile = d3.tile()
	.size([width, height]);

// d3 zoom: this is not just for maps, you can also use zoom for scatterplots.

var zoom = d3.zoom()
	.scaleExtent([  //scaleExtent
		1 << 11,
		1 << 24
		])
// the tile system. one converted to binary, bits get shifted.
// 1 << 1
// 2
// 1 << 2
// 4
// 1 << 3
// 8
	.on('zoom', zoomed);  //define zoomed function later

var radius = d3.scaleSqrt().range([0, 10]);   //radius from 0 to 10. 

var svg = d3.select('body')
	.append('svg')
	.attr('width', width)
	.attr('height', height);

//define taster
var raster = svg.append('g');

// // create a vector
// var vector = svg.append('path');  // draw a single path

var vector = svg.selectAll('path');



/////// LOAD OUR DATA!!!

d3.json('data/CA_Earthquake.geojson', function(error, geojson) {
	if (error) throw error;

	console.log(geojson);


	radius.domain([0, d3.max(geojson.features, function(d) { return d.properties.mag; })]);

	path.pointRadius(function (d) {
		return radius(d.properties.mag);
	});

	// // find our vector data
	// vector.datum(geojson);

	vector = vector
		.data(geojson.features)
		.enter().append('path')
		.attr('d', path)
		.on('mouseover', function(d) { console.log(d); });

	//arbitruary projection 
	var center = projection([-119.665, 37.414]);

	// svg call, transform event.
	svg.call(zoom)
		.call(
			zoom.transform,
			d3.zoomIdentity
				.translate(width / 2, height / 2)
				.scale(1 << 14)
				.translate(-center[0], -center[1])
				);

});


function zoomed () {
	//pass svg transform event.
	var transform = d3.event.transform;

	var tiles = tile
		.scale(transform.k)
		.translate([transform.x, transform.y])
		();

	console.log(transform.x, transform.y, transform.k);  // check if it works!

	projection
		.scale(transform.k / tau)
		.translate([transform.x, transform.y]);

	vector
		.attr('d', path);

	var image = raster
		.attr('transform', stringify(tiles.scale, tiles.translate))
		.selectAll('image')
		.data(tiles, function(d) { return d; });
	
	// svg has a special image tag

	image.exit().remove();

	image.enter().append('image')
		.attr('xlink:href', function(d) {
			return 'http://' + 'abc'[d[1] % 3] + '.basemaps.cartocdn.com/rastertiles/voyager' +
				d[2] + '/' + d[0] + '/' + d[1] + '.png';
		})
		.attr('x', function(d) { return d[0] * 256; }) //256: the size of our tiles
		.attr('y', function(d) { return d[1] * 256; })
		.attr('width', 256)
		.attr('height', 256);





};  //////////////end of zoomed function


function stringify(scale, translate) {
	var k = scale / 256,
		r = scale % 1 ? Number : Math.round; 
	return `translate(${r(translate[0] * scale)}, ${r(translate[1] * scale)}) scale(${k})`   //everything within {} gets interpreted by 
};




// leaflet web mapping library


// http://leaflet-extras.github.io/leaflet-providers/preview/

// mapbox studio





// maps: https://blog.mapbox.com/binning-an-alternative-to-point-maps-2cfc7b01d2ed 

// zoom in further, circle appears smaller. 
// resize the circle as you zoom in. 
// http://www.delimited.io/blog/2013/12/1/hexbins-with-d3-and-leaflet-maps















































