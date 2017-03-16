// visualize.js -- Code for wrangling ETF data.

// ----------------------------------------------------------------------------
// Globals
// ----------------------------------------------------------------------------

// Initialized when data is loaded.
var all_etfs = null;

// Modified as user adds/removes ETFs from the ETF drawer.
var selected_etfs = null;


// ----------------------------------------------------------------------------
// Dataset wrangling
// ----------------------------------------------------------------------------

var parseDate = d3.timeParse("%m/%d/%Y");

// This function loads our CSV dataset, parsing into per-row JSON objects.
function load_dataset(callback) {
    d3.json("data/historical_nav_details.json", function(d) {
        // Build a JSON object for each row.
        var data = {};

        for (var key in d) {
            if (d.hasOwnProperty(key)) {
                data[key] = {
                    ticker: key,
                    proshares_name: d[key]['Name'],
                    holdings: d[key]['Holdings'],
                    holdings_long: d[key]['HoldingLong'],
                    holdings_short: d[key]['HoldingsShort'],
                    sectors: d[key]['Sectors'],
                    sectors_long: d[key]['SectorsLong'],
                    sectors_short: d[key]['SectorsShort'],
                    sub_sectors: d[key]['SubSectors'],
                    countries: d[key]['Countries']
                };
            }
        }
        // Set the resulting list of objects to a global.
        all_etfs = data;

        // If a callback was provided, call it.
        if (typeof(callback) === "function" && callback) {
            callback();
        }
    });
}

// This function loads a specific etf, parsing the arrays properly
function load_etf(etfTicker, callback) {
    // Upper case Ticker
    etfTicker = etfTicker.toUpperCase();

    // Check if ETF already loaded. If so, skip loading again
    if (all_etfs.hasOwnProperty(etfTicker)) {
        if (all_etfs[etfTicker].hasOwnProperty('NAV')) {
            // If a callback was provided, call it.
            if (typeof(callback) === "function" && callback) {
                callback();
            }
            return;
        }
    } else {
        // Don't populate if etf is not in all_etfs.
        return;
    }

    d3.json("data/json_files_tickers/" + etfTicker + ".json", function(d) {
        // Build a JSON object for ticker.
        var date = [];
        var nav = [];
        var yhv = [];

        var dates = d['Date'];
        dates.forEach(function(o) {
            date.push(parseDate(o))
        });
        var navs = d['NAV'];
        navs.forEach(function(o) {
            nav.push(+o)
        });
        var yhvs = d['YHV'];
        yhvs.forEach(function(o) {
            yhv.push(+o)
        });

        all_etfs[etfTicker]['date'] = date;
        all_etfs[etfTicker]['nav'] = nav;
        all_etfs[etfTicker]['yhv'] = yhv;

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
function display_proshares() {
    // Display ProShares names in console.
    // ERROR HERE HAD TO COMMENT OUT var names = all_etfs.map(function(d) { return d.proshares_name });
    // Filter to just the unique values.
    // ERROR HERE HAD TO COMMENT OUTconsole.log(d3.set(names).values());
    // Repeat the process for ticker names.
    // ERROR HERE HAD TO COMMENT OUTvar tickers = all_etfs.map(function(d) { return d.ticker });
    // ERROR HERE HAD TO COMMENT OUTconsole.log(d3.set(tickers).values());
}


// ----------------------------------------------------------------------------
// Initialization functions
// ----------------------------------------------------------------------------

// This function runs once the document has loaded/rendered.
$(document).ready(function () {
    // Use dumb-but-effective callback chaining to get things done.
    load_dataset(function (){
        console.info(all_etfs);
        display_proshares();
    });
});
