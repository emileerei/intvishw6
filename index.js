chart("updated_total.csv", 1);
chart("updated_average.csv", 2);


var datearray = [];
var colorrange = [];

function chart(csvpath, chartNum) {
  // color scheme
  colorrange = [
    "#5f4690", // commuter
    "#edad08", // bus (bus)
    "#666666", // bus (silver line)
    "#994e95", // RIDE
    "#cc503e", // rail (red)
    "#0f8554", // rail (green)
    "#1d6996", // rail (blue)
    "#e17c05", // rail (orange)
    "#38a6a5" // ferry
    ];
  strokecolor = "#000";

  // replacing all .chart with corresponding class name
  var chartString = "";
  if (chartNum === 1) {
    chartString = ".chart";
  } else {
    chartString = ".chart2";
  }

  // time formatting
  var format = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ");

  // svg/chart positioning
  var margin = { top: 40, right: 90, bottom: 30, left: 70 };
  var width = document.body.clientWidth - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  // placement of tooltip text
  var tooltip = d3.select("body")
    .append("div")
    .attr("class", "remove")
    .style("background", "#fff")
    .style("border", "1px solid #000")
    .style("padding", "5px 20px 5px 20px")
    .style("position", "absolute")
    .style("z-index", "20")
    .style("visibility", "hidden")
    .style("top", function () {
      if (chartNum === 1) {
        return "30px";
      } else {
        return height + 145 + "px";
      }
    })
    .style("left", "50px");

  var x = d3.time.scale()
    .range([0, 900]);

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
      return [7, 6, 5, 4, 8, 2,3, 1, 0].reverse();
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

  // legend creation
  var legend = svg.selectAll('legend')
    .data(colorrange)
    .enter().append('g')
    .attr('class', 'legend')
    .style('z-index', '25')
    .attr('transform', function (d, i) { return 'translate(1000,' + i * 30 + ')'; });

  legend.append('rect')
    .attr('y', 20)
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', function (d, i) { return colorrange[i]; });

  legend.append("text")
    .attr("x", 23)
    .attr("y", 25)
    .attr("dy", ".8em")
    .style("text-anchor", "start")
    .style("font-size", "10.5px")
    .text(function (d, i) {
      switch (i) {
        case 0: return "Commuter Rail";
        case 1: return "Bus (Bus)";
        case 2: return "Bus (Silver Line)";
        case 3: return "The RIDE";
        case 4: return "Rail (Red)";
        case 5: return "Rail (Green)";
        case 6: return "Rail (Blue)";
        case 7: return "Rail (Orange)";
        case 8: return "Ferry (Boat-F1)";
      }
    });

  var graph = d3.csv(csvpath, function (data) {
    data.forEach(function (d) {
      d.date = format.parse(d.date);
      d.value = +d.value;
    });

    // creation of streams
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
      .attr("transform", "translate(" + 900 + ", 0)")
      .call(yAxis.orient("right"));

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis.orient("left"));

    svg.selectAll(".layer")
      .attr("opacity", 1)
      .on("mouseover", function (d, i) {
        svg.selectAll(".layer").transition()
          .duration(300)
          .attr("opacity", function (d, j) {
            return j != i ? 0.5 : 1;
          })
      })

      // getting value to display as user mouses over graph
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
        var formatComma = d3.format(',');

        d3.select(this)
          .classed("hover", true)
          .attr("stroke", strokecolor)
          .attr("stroke-width", "0.5px"),
          tooltip.html("<p>Mode: " + d.key + "<br>Passenger Count:<br>" + formatComma(pro) + " Passengers</p>").style("visibility", "visible");

      })
      .on("mouseout", function (d, i) {
        svg.selectAll(".layer")
          .transition()
          .duration(250)
          .attr("opacity", "1");
        d3.select(this)
          .classed("hover", false)
          .attr("stroke-width", "0px"), tooltip.html("<p>Mode: " + d.key + "<br>Passenger Count:" + pro + " Passengers</p>").style("visibility", "hidden");
      });
  });
}