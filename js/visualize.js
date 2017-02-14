var timeline = { "svg": null,
    "g": null,
    "x": null,
    "y": null,
    "margin": {top: 0, right: 0, bottom: 0, left: 0}
};
timeline.width = parseInt(d3.select('#timeline-div').style('width'), 10);
timeline.width = timeline.width - timeline.margin.left - timeline.margin.right;
timeline.height = 80 - timeline.margin.top - timeline.margin.bottom - 8;


// Function to display timeline.
// Note: Requires some hacking for size and position adjustments.
function renderTimeline() {
    // update width
    timeline.width = parseInt(d3.select('#timeline-div').style('width'), 10) - timeline.margin.left - timeline.margin.right;

    // remove it already displaying
    d3.select("svg").remove();

    timeline.svg = d3.select("#timeline-div").append("svg")
        .attr("width", timeline.width + "px")
        .attr("height", "80px")
        .attr("preserveAspectRatio", "none");

    timeline.g = timeline.svg.append("g")
        .attr("transform", "translate(" + timeline.margin.left + "," + (timeline.margin.top + 4) + ")");

    timeline.x = d3.scaleBand().rangeRound([0, timeline.width]).padding(0.1);
    timeline.y = d3.scaleLinear().rangeRound([timeline.height, 0]);

    d3.tsv("data/data.tsv", function(d) {
        d.frequency = +d.frequency;
        return d;
    }, function(error, data) {
        if (error) throw error;

        timeline.x.domain(data.map(function(d) { return d.letter; }));
        timeline.y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

        timeline.g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return timeline.x(d.letter); })
            .attr("y", function(d) { return timeline.y(d.frequency); })
            .attr("width", timeline.x.bandwidth())
            .attr("height", function(d) { return timeline.height - timeline.y(d.frequency); })
    });

}

window.addEventListener('resize', renderTimeline);
renderTimeline();


// Initialized when data is loaded.
dataset = null;

// This function loads our CSV dataset, parsing into per-row JSON objects.
function load_dataset(callback) {
    var parseDate = d3.timeParse("%m/%d/%Y");
    d3.csv("data/historical_nav.csv", function(d) {
        // Build a JSON object for each row.
        return {
            date:                     parseDate(d['Date']),
            proshares_name:           d['ProShares Name'],
            ticker:                   d['Ticker'],
            nav:                     +d['NAV'],
            prior_nav:               +d['Prior NAV'],
            nav_change_percent:      +d['NAV Change (%)'],
            nav_change_dollars:      +d['NAV Change ($)'],
            shares_outstanding:      +d['Shares Outstanding (000)'],
            assets_under_management: +d['Assets Under Management']
        }
    }, function(error, data) {
        // Push the resulting list of objects to a global.
        dataset = data;
        // If a callback was provided, call it.
        if (typeof(callback) === "function" && callback) {
            callback();
        }
    });
}


// Function to show unique ProShares/Ticker names.
function display_proshares() {
    // Display ProShares names in console.
    var names = dataset.map(function(d) { return d.proshares_name });
    // Filter to just the unique values.
    console.log(d3.set(names).values());
    // Repeat the process for ticker names.
    var tickers = dataset.map(function(d) { return d.ticker });
    console.log(d3.set(tickers).values());
}


// This function runs once the document has loaded/rendered.
$(document).ready(function () {
    // Use dumb-but-effective callback chaining to get things done.
    load_dataset(function (){
        display_proshares();
    });
});
