var svg2 = d3.select("#scatterplot"),
    margin = {top: 40, right: 120, bottom: 60, left: 70},   
    width = +svg2.attr("width") - margin.left - margin.right,
    height = +svg2.attr("height") - margin.top - margin.bottom;

var g = svg2.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Tooltip
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("font-size", "18px");

// SLIDER references
var scatterSlider = d3.select("#scatterYearSlider");
var scatterLabel = d3.select("#scatterYearLabel");

// Load data
d3.csv("trial2.csv", function(error, rawdata) {

    rawdata.forEach(function(d) {
        d.year = +d.year;
        d.gini = +d.gini_disp_mean;
        d.repress = +d.v2csreprss;
        d.class = d.class;
    });

    // Extracting unique years
    var years = Array.from(new Set(rawdata.map(d => d.year))).sort();
    var defaultYear = years[years.length - 1];

    //Slider setup
    scatterSlider.attr("min", years[0]);
    scatterSlider.attr("max", years[years.length - 1]);
    scatterSlider.property("value", defaultYear);
    scatterLabel.text(defaultYear);

    var color = d3.scaleOrdinal()
        .domain(["anocracy", "democracy", "autocracy"])
        .range(["#a57e2bff", "#04724D", "#A53F2B"]);

    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var xAxisGroup = g.append("g")
        .attr("transform", "translate(0," + height + ")");

    var yAxisGroup = g.append("g");

    // Chart Title
    g.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", -10)
        .style("text-anchor", "middle")
        .style("font-size", "25px")
        .style("font-weight", "bold")
        .text("Inequality vs Repression by Regime Type");

    // IA: How to add titles to a d3.js scatter plot
    g.append("text")
        .attr("class", "x label")
        .attr("x", width / 2)
        .attr("y", height + 45)
        .style("text-anchor", "middle")
        .style("font-size", "25px")
        .text("Gini (Inequality)");

    g.append("text")
        .attr("class", "y label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .style("text-anchor", "middle")
        .style("font-size", "25px")
        .text("Repression Level");

    // IA: How to add a legend to a d3.js scatter plot
    var legendData = [
        {label: "Anocracy", color: "#a57e2bff"},
        {label: "Democracy", color: "#04724D"},
        {label: "Autocracy", color: "#A53F2B"}
    ];

    var legend = g.append("g")
        .attr("transform", "translate(" + (width + 20) + ", 20)");

    legend.selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 22)
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", d => d.color);

    legend.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", 22)
        .attr("y", (d, i) => i * 22 + 12)
        .style("font-size", "18px")
        .text(d => d.label);

    // IA: How to update a d3.js scatter plot based on a slider input
    function update(year) {

        var data = rawdata.filter(d => d.year === +year);
        data = data.filter(d => !isNaN(d.gini) && !isNaN(d.repress));

        x.domain(d3.extent(data, d => d.gini)).nice();
        y.domain(d3.extent(data, d => d.repress)).nice();

        xAxisGroup.call(d3.axisBottom(x))
            .selectAll("text")
            .style("font-size", "16px");

        yAxisGroup.call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "16px");

        var circles = g.selectAll("circle")
            .data(data, d => d.country_text_id);

        circles.exit().remove();

        circles
            .transition()
            .duration(500)
            .attr("cx", d => x(d.gini))
            .attr("cy", d => y(d.repress))
            .attr("fill", d => color(d.class));

        circles.enter()
            .append("circle")
            .attr("r", 5)
            .attr("cx", d => x(d.gini))
            .attr("cy", d => y(d.repress))
            .attr("fill", d => color(d.class))
            .attr("opacity", 0.85)
            .on("mouseover", function(d) {
                tooltip
                    .style("opacity", 1)
                    .html(
                        "<b>" + d.country_name + "</b><br>" +
                        "Gini: " + d.gini + "<br>" +
                        "Repression: " + d.repress + "<br>" +
                        "Class: " + d.class
                    );
            })
            .on("mousemove", function() {
                tooltip
                    .style("left", (d3.event.pageX + 12) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("opacity", 0);
            });
    }

    update(defaultYear);

    // SLIDER EVENTS
    scatterSlider.on("input", function() {
        let year = +this.value;
        scatterLabel.text(year);
        update(year);
    });

});
 