var svgWidth = 1250;
var svgHeight = 1250;

var margin = {
    top: 580,
    right: 350,
    bottom: 40,
    left: 200
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// SVG wrapper. Append an SVG -> hold chart
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");

// Labels -> X axis
svg.append("g").attr("class", "xAxisLabel");
var xAxisLabel = d3.select(".xAxisLabel");

function xAxisLabelRefresh() {
    xAxisLabel.attr("transform", `translate(${margin.left+200}, ${margin.top})`);
}
xAxisLabelRefresh();

// X Variables:
// Poverty Variable
xAxisLabel.append("text")
    .attr("y", -26)
    .attr("dataVariable", "poverty")
    .attr("infoAxis", "x")
    .attr("class", "aText active x")
    .text("In Poverty (%)");
// Age Variable
xAxisLabel.append("text")
    .attr("y", 0)
    .attr("dataVariable", "age")
    .attr("infoAxis", "x")
    .attr("class", "aText inactive x")
    .text("Age (Median)");
// Income Variable
xAxisLabel
    .append("text")
    .attr("y", 26)
    .attr("dataVariable", "income")
    .attr("infoAxis", "x")
    .attr("class", "aText inactive x")
    .text("Household Income (Median)");

// Labels -> Y axis
var labelSpace = 100; // Space for labels
var leftTextX = margin.bottom;
var leftTextY = (height + labelSpace) / 2 - labelSpace;

svg.append("g").attr("class", "yAxisLabel");
var yAxisLabel = d3.select(".yAxisLabel");

function yAxisLabelRefresh() {
    yAxisLabel.attr(
        "transform",
        "translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)"
    );
}
yAxisLabelRefresh();

// Y Variables:
// Healthcare
yAxisLabel
    .append("text")
    .attr("y", 26)
    .attr("dataVariable", "healthcare")
    .attr("infoAxis", "y")
    .attr("class", "aText inactive y")
    .text("Lacks Healthcare (%)");

// Obesity
yAxisLabel
    .append("text")
    .attr("y", -26)
    .attr("dataVariable", "obesity")
    .attr("infoAxis", "y")
    .attr("class", "aText active y")
    .text("Obese (%)");

// Smokes
yAxisLabel
    .append("text")
    .attr("x", 0)
    .attr("dataVariable", "smokes")
    .attr("infoAxis", "y")
    .attr("class", "aText inactive y")
    .text("Smokes (%)");

// Importing csv data
d3.csv("assets/data/data.csv").then(function (data) {
    visualize(data);
});

// Visualization 
function visualize(csvData) {
    var Xvalue = "poverty";
    var wValue = "obesity";
    var xMin;
    var xMax;
    var yMin;
    var yMax;

    // Tooltip Rules
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([40, -60])
        .html(function (d) {
            var State = "<div>" + d.state + "</div>";
            var xVariable;
            var YVariable = "<div>" + wValue + ": " + d[wValue] + "%</div>";
            if (Xvalue === "poverty") {
                xVariable = "<div>" + Xvalue + ": " + d[Xvalue] + "%</div>";
            }
            else {
                xVariable = "<div>" +
                    Xvalue +
                    ": " +
                    parseFloat(d[Xvalue]).toLocaleString("en") +
                    "</div>";
            }
            return State + xVariable + YVariable;
        });

    svg.call(toolTip); // Calling the toolTip function

    function labelChange(axis, clickedText) {
        d3.selectAll(".aText")
            .filter("." + axis)
            .filter(".active")
            .classed("active", false)
            .classed("inactive", true);

        clickedText.classed("inactive", false).classed("active", true);
    }

    function xMinMax() {
        xMin = d3.min(csvData, function (d) {
            return parseFloat(d[Xvalue]) * 0.90;
        });

        xMax = d3.max(csvData, function (d) {
            return parseFloat(d[Xvalue]) * 1.10;
        });
    }

    function yMinMax() {
        yMin = d3.min(csvData, function (d) {
            return parseFloat(d[wValue]) * 0.90;
        });

        yMax = d3.max(csvData, function (d) {
            return parseFloat(d[wValue]) * 1.10;
        });
    }

    // Scatter Plot

    xMinMax();
    yMinMax();

    var xLinearScale = d3.scaleLinear()
        .domain([xMin, xMax])
        .range([10 + labelSpace, width - 10]);
    var yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range([height - 10 - labelSpace, 10]);

    var xAxis = d3.axisBottom(xLinearScale);
    var yAxis = d3.axisLeft(yScale);

    function tickCount() {
        xAxis.ticks(10);
        yAxis.ticks(10);
    }
    tickCount();

    svg
        .append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + (height - 10 - labelSpace) + ")");
    svg
        .append("g")
        .call(yAxis)
        .attr("class", "yAxis")
        .attr("transform", "translate(" + (10 + labelSpace) + ", 0)");

    var theCircles = svg.selectAll("g theCircles").data(csvData).enter();
    var circRadius = 10;
    theCircles
        .append("circle")
        .attr("cx", function (d) {
            return xLinearScale(d[Xvalue]);
        })
        .attr("cy", function (d) {
            return yScale(d[wValue]);
        })
        .attr("r", circRadius)
        .attr("class", function (d) {
            return "stateCircle " + d.abbr;
        })
        .on("mouseover", function (d) {
            toolTip.show(d, this);
            d3.select(this).style("stroke", "#323232");
        })
        .on("mouseout", function (d) {
            toolTip.hide(d);
            d3.select(this).style("stroke", "#e3e3e3");
        });

    theCircles
        .append("text")
        .text(function (d) {
            return d.abbr;
        })
        .attr("dx", function (d) {
            return xLinearScale(d[Xvalue]);
        })
        .attr("dy", function (d) {
            return yScale(d[wValue]) + circRadius / 2.5;
        })
        .attr("font-size", circRadius)
        .attr("class", "stateText")
        .on("mouseover", function (d) {
            toolTip.show(d);
            d3.select("." + d.abbr).style("stroke", "#323232");
        })
        .on("mouseout", function (d) {
            toolTip.hide(d);
            d3.select("." + d.abbr).style("stroke", "#e3e3e3");
        });

    // Dynamic

    d3.selectAll(".aText").on("click", function () {

        var self = d3.select(this);
        if (self.classed("inactive")) {
            var axis = self.attr("infoAxis");
            var name = self.attr("dataVariable");

            if (axis === "x") {
                Xvalue = name;

                xMinMax();

                xLinearScale.domain([xMin, xMax]);

                svg.select(".xAxis").transition().duration(300).call(xAxis);

                d3.selectAll("circle").each(function () {

                    d3
                        .select(this)
                        .transition()
                        .attr("cx", function (d) {
                            return xLinearScale(d[Xvalue]);
                        })
                        .duration(300);
                });

                d3.selectAll(".stateText").each(function () {
                    d3
                        .select(this)
                        .transition()
                        .attr("dx", function (d) {
                            return xLinearScale(d[Xvalue]);
                        })
                        .duration(300);
                });

                labelChange(axis, self);
            }
            else {
                wValue = name;

                yMinMax();

                yScale.domain([yMin, yMax]);

                svg.select(".yAxis").transition().duration(300).call(yAxis);

                d3.selectAll("circle").each(function () {
                    d3
                        .select(this)
                        .transition()
                        .attr("cy", function (d) {
                            return yScale(d[wValue]);
                        })
                        .duration(300);
                });

                d3.selectAll(".stateText").each(function () {
                    d3
                        .select(this)
                        .transition()
                        .attr("dy", function (d) {
                            return yScale(d[wValue]) + circRadius / 3;
                        })
                        .duration(300);
                });

                labelChange(axis, self);
            }
        }
    });
};
