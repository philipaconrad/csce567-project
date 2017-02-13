var timeline = { "svg": null,
    "g": null,
    "x": null,
    "y": null,
    "margin": {top: 0, right: 0, bottom: 0, left: 0}
};
timeline.width = parseInt(d3.select('#timeline-div').style('width'), 10);
timeline.width = timeline.width - timeline.margin.left - timeline.margin.right;
timeline.height = 80 - timeline.margin.top - timeline.margin.bottom;

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
        .attr("transform", "translate(" + timeline.margin.left + "," + timeline.margin.top + ")");

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