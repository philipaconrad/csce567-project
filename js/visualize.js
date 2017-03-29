// visualize.js -- Code for wrangling ETF data.

// ----------------------------------------------------------------------------
// Globals
// ----------------------------------------------------------------------------

// Initialized when data is loaded.
var allETFs = null;

// Modified as user adds/removes ETFs from the ETF drawer.
var selectedETFs = null;


// ----------------------------------------------------------------------------
// Dataset wrangling
// ----------------------------------------------------------------------------

var parseDate = d3.timeParse("%m/%d/%Y");

// This function loads our CSV dataset, parsing into per-row JSON objects.
function loadDataset(callback) {
    d3.json("data/historical_nav_details.json", function(d) {
        // Function to help add values to object so no empty or undefined values are added
        function addValue(value, tickerObject, key) {
            if (value !== undefined && value !== null && Object.keys(value).length > 0) {
                tickerObject[key] = value
            }
        }

        // Build a JSON object for each row.
        var data = {};

        for (var key in d) {
            if (d.hasOwnProperty(key)) {
                var tickerObj = {
                    ticker: key,
                    proshares_name: d[key]['Name']
                };

                addValue(d[key]['Holdings'], tickerObj, 'holdings');
                addValue(d[key]['HoldingLong'], tickerObj, 'holdingsLong');
                addValue(d[key]['HoldingsShort'], tickerObj, 'holdingsShort');
                addValue(d[key]['Sectors'], tickerObj, 'sectors');
                addValue(d[key]['SectorsLong'], tickerObj, 'sectorsLong');
                addValue(d[key]['SectorsShort'], tickerObj, 'sectorsShort');
                addValue(d[key]['SubSectors'], tickerObj, 'subSectors');
                addValue(d[key]['Countries'], tickerObj, 'countries');

                data[key] = tickerObj;
            }
        }
        // Set the resulting list of objects to a global.
        allETFs = data;

        // If a callback was provided, call it.
        if (typeof(callback) === "function" && callback) {
            callback();
        }
    });
}

// This function loads a specific etf, parsing the arrays properly
function loadETF(etfTicker, callback) {
    // Upper case Ticker
    etfTicker = etfTicker.toUpperCase();

    // Check if ETF already loaded. If so, skip loading again
    if (allETFs.hasOwnProperty(etfTicker)) {
        if (allETFs[etfTicker].hasOwnProperty('NAV')) {
            // If a callback was provided, call it.
            if (typeof(callback) === "function" && callback) {
                callback();
            }
            return;
        }
    } else {
        // Don't populate if etf is not in allETFs.
        return;
    }

    d3.json("data/json_files_tickers/" + etfTicker + ".json", function(d) {
        // Build a JSON object for ticker.
        var date = [];
        var nav = [];
        var yhv = [];

        var dates = d['Date'];
        dates.forEach(function(o) {
            date.push(parseDate(o));
        });
        var navs = d['NAV'];
        navs.forEach(function(o) {
            nav.push(+o);
        });
        var yhvs = d['YHV'];
        yhvs.forEach(function(o) {
            yhv.push(+o);
        });

        allETFs[etfTicker]['date'] = date;
        allETFs[etfTicker]['nav'] = nav;
        allETFs[etfTicker]['yhv'] = yhv;

        // If a callback was provided, call it.
        if (typeof(callback) === "function" && callback) {
            callback();
        }
    });
}


// ----------------------------------------------------------------------------
// Miscellaneous functions
// ----------------------------------------------------------------------------

// Function to show unique ProShares/Ticker names.
function displayProshares() {
    var drawerDiv = document.getElementById('etf-drawer');
    var html = '';
    var i = 0;
    for (var key in allETFs) {
        // Start a new row.
        if (i == 0) {
            html += '<div class="row">';
        }
        // Add an ETF card.
        if (allETFs.hasOwnProperty(key)) {
            html += '<div class="col m2">'+
                    '<div class="card blue-grey darken-1">' +
                    '<div class="card-content white-text">' +
                    '<span class="etf-title">' + allETFs[key].ticker +
                    '</span>' +
                    '<div class="etf-info">' +
                    '<p>' + allETFs[key].proshares_name +'</p>' +
                    '</div></div></div></div>'
        }
        i += 1;
        // End the row.
        if (i == 6) {
            html += '</div>';
            i = 0;
        }
    }
    drawerDiv.innerHTML = html;
}

// Function to show the performance graph.
function displayPerformanceGraph() {
	// Get the data formatted and averaged from averageETFs function
	var data = averageSelectedETFs();
	
	// define dimensions of graph
	var margin = {top: 20, right: 20, bottom: 20, left: 20}; // margins
	var width = parseInt(d3.select("#performance").style("width"), 10);
	width = width - margin.top - margin.bottom; // width
	var height = parseInt(d3.select("#performance").style("height"), 10);
	height = height - margin.right - margin.right; // height
	
	// Set the ranges
	var x = d3.scaleTime().range([0, width]);
	var y = d3.scaleLinear().range([height, 0]);

	// define the line
	var valueline = d3.line()
		.x(function(d) { return x(d.date); })
		.y(function(d) { return y(d.average); });

	// append the svg obgect to the body of the page
	// appends a 'group' element to 'svg'
	// moves the 'group' element to the top left margin
	var svg = d3.select("#performance-svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	// Scale the range of the data
		x.domain(d3.extent(data, function(d) { return d.date; }));
		y.domain([d3.min(data, function(d) { return d.average; })-2, d3.max(data, function(d) { return d.average; })+2]);

	// Add the valueline path.
	svg.append("path")
		.data([data])
		.attr("class", "line")
		.attr("d", valueline);

	// Add the X Axis
	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	// Add the Y Axis
	svg.append("g")
		.call(d3.axisLeft(y));
}

// ----------------------------------------------------------------------------
// Initialization functions
// ----------------------------------------------------------------------------

// This function runs once the document has loaded/rendered.
$(document).ready(function () {
    // Use dumb-but-effective callback chaining to get things done.
    loadDataset(function (){
        console.info(allETFs);
        displayProshares();
        displayPerformanceGraph();
    });
});
