chart("updated_total.csv", 1);
chart("updated_average.csv", 2);

var datearray = [];
var colorrange = [];

function chart(csvpath, chartNum) {
  // color scheme
  colorrange = [
    "#741647", // commuter
    "#e06666", // bus (bus)
    "#d9d9d9", // bus (silver line)
    "#333333", // RIDE
    "#cc0000", // rail (red)
    "#38761d", // rail (green)
    "#6fa8dc", // rail (blue)
    "#ff9900", // rail (orange)
    "#0c343d" // ferry
    ];
  strokecolor = "#fff";

  // replacing all .chart with corresponding class name
  chartString = "";
  if (chartNum == 1) {
    chartString = ".chart";
  } else {
    chartString = ".chart2";
  }

  // time formatting
  var format = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ");

  // svg/chart positioning
  var margin = { top: 20, right: 90, bottom: 30, left: 70 };
  var width = document.body.clientWidth - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  // placement of tooltip text
  var tooltip = d3.select("body")
    .append("div")
    .attr("class", "remove")
    .style("position", "absolute")
    .style("z-index", "20")
    .style("visibility", "hidden")
    .style("top", "30px")
    .style("left", "50px");

  var x = d3.time.scale()
    .range([0, width]);

  var y = d3.scale.linear()
    .range([height - 10, 0]);

  var z = d3.scale.ordinal()
    .range(colorrange);

  // x and y axis setup
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(d3.time.years);

  var yAxis = d3.svg.axis()
    .scale(y);

  var yAxisr = d3.svg.axis()
    .scale(y);

  var stack = d3.layout.stack()
    .offset("wiggle")
    .order(function (d) {
      console.log(d);
      return d3.range(d.length);
    })
    .values(function (d) { return d.values; })
    .x(function (d) { return d.date; })
    .y(function (d) { return d.value; });

  var nest = d3.nest()
    .key(function (d) { return d.mode; });

  var area = d3.svg.area()
    .interpolate("cardinal")
    .x(function (d) { return x(d.date); })
    .y0(function (d) { return y(d.y0); })
    .y1(function (d) { return y(d.y0 + d.y); });

  var svg = d3.select(chartString).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var graph = d3.csv(csvpath, function (data) {
    data.forEach(function (d) {
      d.date = format.parse(d.date);
      d.value = +d.value;
    });

    var layers = stack(nest.entries(data));

    x.domain(d3.extent(data, function (d) { return d.date; }));
    y.domain([0, d3.max(data, function (d) { return d.y0 + d.y; })]);
    
    svg.selectAll(".layer")
      .data(layers)
      .enter().append("path")
      .attr("class", "layer")
      .attr("d", function (d) { return area(d.values); })
      .style("fill", function (d, i) { return z(i); });

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width + ", 0)")
      .call(yAxis.orient("right"));

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis.orient("left"));

    svg.selectAll(".layer")
      .attr("opacity", 1)
      .on("mouseover", function (d, i) {
        svg.selectAll(".layer").transition()
          .duration(250)
          .attr("opacity", function (d, j) {
            return j != i ? 0.6 : 1;
          })
      })

      .on("mousemove", function (d, i) {
        mousex = d3.mouse(this);
        mousex = mousex[0];
        var invertedx = x.invert(mousex);
        invertedx = invertedx.getYear() + invertedx.getMonth();
        var selected = (d.values);
        for (var k = 0; k < selected.length; k++) {
          datearray[k] = selected[k].date
          datearray[k] = datearray[k].getYear() + datearray[k].getMonth();
        }

        mousedate = datearray.indexOf(invertedx);
        pro = d.values[mousedate].value;

        d3.select(this)
          .classed("hover", true)
          .attr("stroke", strokecolor)
          .attr("stroke-width", "0.5px"),
          tooltip.html("<p>" + d.key + "<br>" + pro + "</p>").style("visibility", "visible");

      })
      .on("mouseout", function (d, i) {
        svg.selectAll(".layer")
          .transition()
          .duration(250)
          .attr("opacity", "1");
        d3.select(this)
          .classed("hover", false)
          .attr("stroke-width", "0px"), tooltip.html("<p>" + d.key + "<br>" + pro + "</p>").style("visibility", "hidden");
      })

    var vertical = d3.select(".chart")
      .append("div")
      .attr("class", "remove")
      .style("position", "absolute")
      .style("z-index", "19")
      .style("width", "1px")
      .style("height", "380px")
      .style("top", "10px")
      .style("bottom", "30px")
      .style("left", "0px")
      .style("background", "#fff");

    d3.select(chartString)
      .on("mousemove", function () {
        mousex = d3.mouse(this);
        mousex = mousex[0] + 5;
        vertical.style("left", mousex + "px")
      })
      .on("mouseover", function () {
        mousex = d3.mouse(this);
        mousex = mousex[0] + 5;
        vertical.style("left", mousex + "px")
      });
  });
}