// visualize.js -- Code for wrangling ETF data.

// ----------------------------------------------------------------------------
// Globals
// ----------------------------------------------------------------------------

// Initialized when data is loaded.
var allETFs = null;

// Modified as user adds/removes ETFs from the ETF drawer.
// Array of strings, representing the etf ticker
var selectedETFs = [];


// ----------------------------------------------------------------------------
// Dataset wrangling
// ----------------------------------------------------------------------------

var parseDate = d3.timeParse("%m/%d/%y");
var formatDate = d3.timeFormat("%y/%m/%d");

// This function loads our CSV dataset, parsing into per-row JSON objects.
function loadDataset(callback) {
    d3.json("data/historical_nav_details.json", function (d) {
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
                addValue(d[key]['HoldingsLong'], tickerObj, 'holdingsLong');
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
// Recommended callback when adding to selectedETFs so performance won't be loaded till etf data is loaded
function loadETF(etfTicker, callback) {
    // Upper case Ticker
    etfTicker = etfTicker.toUpperCase();

    // Check if ETF already loaded. If so, skip loading again
    if (allETFs.hasOwnProperty(etfTicker)) {
        if (allETFs[etfTicker].hasOwnProperty('nav')) {
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

    d3.json("data/json_files_tickers/" + etfTicker + ".json", function (d) {
        // Build a JSON object for ticker.
        var date = [];
        var nav = [];
        var yhv = [];

        var dates = d['Date'];
        dates.forEach(function (o) {
            date.push(parseDate(o));
        });
        var navs = d['NAV'];
        navs.forEach(function (o) {
            nav.push(+o);
        });
        var yhvs = d['YHV'];
        yhvs.forEach(function (o) {
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

// Added ETF to selected ETFs
function selectETF(etf) {
    if (selectedETFs.indexOf(etf) != -1) {
        return;
    }

    // Add to selectedETFs
    selectedETFs.push(etf);

    // Load the etf data and in the callback render the page again
    loadETF(etf, function () {
        render();
    });
}

// Remove ETF from selected ETFs
function removeETF(etf) {
    if (selectedETFs.indexOf(etf) == -1) {
        return;
    }

    // Add to selectedETFs
    var index = selectedETFs.indexOf(etf);
    selectedETFs.splice(index, 1);

    // Render the page again
    render();
}

// Create average data structure for the selected ETFs
function averageSelectedETFs() {

    // Map of dates and values on each date
    var dateMap = {};
    var parseDateBack = d3.timeParse("%y/%m/%d");

    // Loop through each etf
    selectedETFs.forEach(function (etfKey) {
        if (allETFs.hasOwnProperty(etfKey)) {
            var etf = allETFs[etfKey];
            // For each date in the etf add the date and the value to the map
            for (var i = 0; i < etf.date.length; i++) {
                var date = formatDate(etf.date[i]);
                var nav = etf.nav[i];

                // If date not in the map add the empty array
                if (!dateMap.hasOwnProperty(date)) {
                    dateMap[date] = [];
                }
                dateMap[date].push(nav);
            }
        }

    });

    var datesSorted = [];
    for (var d in dateMap) {
        datesSorted.push(d);
    }
    datesSorted.sort();

    var dateArray = [];
    // Sum and get average of each date in the dateMap
    datesSorted.forEach(function(date) {
        if (dateMap.hasOwnProperty(date)) {
            var sum = dateMap[date].reduce(function (a, b) {
                return a + b;
            });
            dateArray.unshift({
                'date': parseDateBack(date),
                'average': sum / dateMap[date].length
            });
        }
    });

    return dateArray;
}


// ----------------------------------------------------------------------------
// Display functions
// ----------------------------------------------------------------------------

// Function to show unique ProShares/Ticker names.
function displayProshares() {
    var drawerDiv = document.getElementById('etf-drawer');
    var html = '';
    var keysSorted = [];
    for (var k in allETFs) {
        keysSorted.push(k);
    }
    keysSorted.sort();
    keysSorted.forEach(function (key) {
        // Add an ETF card.
        if (allETFs.hasOwnProperty(key) && selectedETFs.indexOf(key) == -1) {
            html += '<div id="etf-' + key + '" class="card blue-grey darken-1" onclick="selectETF(\'' + key + '\')">' +
                '<div class="card-content white-text">' +
                '<span class="etf-title">' + allETFs[key].ticker +
                '</span>' +
                '<div class="etf-info">' +
                '<p>' + allETFs[key].proshares_name + '</p>' +
                '</div></div></div>'
        }
    });
    drawerDiv.innerHTML = html;
}

// Function to show selected ProShares/Ticker names.
function displaySelectedProshares() {
    var drawerDiv = document.getElementById('portfolio-drawer');
    var html = '';
    selectedETFs.forEach(function (key) {
        key = key.toUpperCase();
        // Add an ETF card.
        if (allETFs.hasOwnProperty(key)) {
            html += '<div id="etf-' + key + '" class="card blue-grey darken-1" onclick="removeETF(\'' + key + '\')">' +
                '<div class="card-content white-text">' +
                '<span class="etf-title">' + allETFs[key].ticker +
                '</span>' +
                '<div class="etf-info">' +
                '<p>' + allETFs[key].proshares_name + '</p>' +
                '</div></div></div>'
        }
    });
    drawerDiv.innerHTML = html;
}

// Function to show the performance graph.
function displayPerformanceGraph() {
    d3.select("#performance-svg").select("g").remove();

    // Get the data formatted and averaged from averageETFs function
    var data = averageSelectedETFs();

    // define dimensions of graph
    var margin = {top: 20, right: 40, bottom: 20, left: 60}; // margins
    var width = parseInt(d3.select("#performance").style("width"), 10);
    width = width - margin.left - margin.right; // width
    var height = parseInt(d3.select("#performance").style("height"), 10);
    height = height - margin.top - margin.bottom; // height

    // Set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // define the line
    var valueline = d3.line()
        .x(function (d) {
            return x(d.date);
        })
        .y(function (d) {
            return y(d.average);
        });

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#performance-svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // Scale the range of the data
    x.domain(d3.extent(data, function (d) {
        return d.date;
    }));
    y.domain([d3.min(data, function (d) {
        return d.average;
    }) - 2, d3.max(data, function (d) {
        return d.average;
    }) + 2]);

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

// Function to add tooltips to all the etfs
function addToolTips() {
    function htmlForToolTip(label, object, col) {
        var html = '<div class="col s' + col + ' tooltip-align"><u>' + label + '</u><br/>';
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                html += key + ': <span class="tooltip-float">' + object[key] + '%</span><br/>';
            }
        }
        return html + '</div>';
    }

    for (var key in allETFs) {
        if (allETFs.hasOwnProperty(key)) {
            var toolHtml = '<div class="row">';

            if (allETFs[key].hasOwnProperty('sectors')) {
                toolHtml += htmlForToolTip('Sectors', allETFs[key]['sectors'], 12);
            }

            if (allETFs[key].hasOwnProperty('countries')) {
                toolHtml += htmlForToolTip('Countries', allETFs[key]['countries'], 12);
            }

            if (allETFs[key].hasOwnProperty('sectorsLong')) {
                toolHtml += htmlForToolTip('Sectors Long', allETFs[key]['sectorsLong'], 6);
            }
            if (allETFs[key].hasOwnProperty('sectorsShort')) {
                toolHtml += htmlForToolTip('Sectors Short', allETFs[key]['sectorsShort'], 6);
            }

            toolHtml += '</div><div class="row">';
            var foundOther = false;
            if (allETFs[key].hasOwnProperty('holdingsLong')) {
                foundOther = true;
                toolHtml += htmlForToolTip('Holdings Long', allETFs[key]['holdingsLong'], 6);
            }
            if (allETFs[key].hasOwnProperty('holdingsShort')) {
                foundOther = true;
                toolHtml += htmlForToolTip('Holdings Short', allETFs[key]['holdingsShort'], 6);
            }
            if (allETFs[key].hasOwnProperty('holdings')) {
                foundOther = true;
                toolHtml += htmlForToolTip('Holdings', allETFs[key]['holdings'], 12);
            }


            if (!foundOther) {
                toolHtml = toolHtml.substring(0, toolHtml.indexOf('</div>'));
            }

            if (toolHtml.length < 50) {
                toolHtml = 'Detailed info about this ETF is not available.';
            }

            toolHtml += '</div>';
            $('#etf-' + key).tooltip({delay:350, html: true, position: 'top', tooltip: toolHtml});
        }
    }
}

function removeToolTips() {
    for (var key in allETFs) {
        if (allETFs.hasOwnProperty(key)) {
            $('#etf-' + key).tooltip('remove');
        }
    }
}

// Function to render page again
function render() {
    removeToolTips();
    displayProshares();
    displaySelectedProshares();
    displayPerformanceGraph();
    addToolTips();
}

function clear() {
    // Inform user of reset.
    Materialize.toast('Portfolio reset to defaults', 1000, 'green')
    selectedETFs = [];
    render();
}

// ----------------------------------------------------------------------------
// Initialization functions
// ----------------------------------------------------------------------------

// This function runs once the document has loaded/rendered.
$(document).ready(function () {
    // Use dumb-but-effective callback chaining to get things done.
    loadDataset(function () {
        console.info(allETFs);
        render();
    });
});

// This function will run when the window is resized
$(window).on('resize', function () {
    if (allETFs != null) {
        render();
    }
});
