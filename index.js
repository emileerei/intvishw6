chart("data.csv", "blue");
createStackedBar("");

var datearray = [];
var colorrange = [];


function chart(csvpath, color) {

  if (color == "blue") {
    colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
  }
  else if (color == "pink") {
    colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
  }
  else if (color == "orange") {
    colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
  }
  strokecolor = colorrange[0];

  // format
  //var format = d3.time.format("%m/%d/%y");
  //var format = d3.time.format("%y-%m-%d");
  var format = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ");

  var margin = { top: 20, right: 40, bottom: 30, left: 30 };
  var width = document.body.clientWidth - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  var tooltip = d3.select("body")
    .append("div")
    .attr("class", "remove")
    .style("position", "absolute")
    .style("z-index", "20")
    .style("visibility", "hidden")
    .style("top", "30px")
    .style("left", "55px");

  var x = d3.time.scale()
    .range([0, width]);

  var y = d3.scale.linear()
    .range([height - 10, 0]);

  var z = d3.scale.ordinal()
    .range(colorrange);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(d3.time.weeks);

  var yAxis = d3.svg.axis()
    .scale(y);

  var yAxisr = d3.svg.axis()
    .scale(y);

  var stack = d3.layout.stack()
    .offset("silhouette")
    .values(function (d) { return d.values; })
    .x(function (d) { return d.service_date; })
    .y(function (d) { return d.total_monthly_ridership; });
    //.x(function (d) { return d.date; })
    //.y(function (d) { return d.value; });

  var nest = d3.nest()
    //.key(function (d) { return d.key; });
    .key(function (d) { return d.mode; });

  var area = d3.svg.area()
    .interpolate("cardinal")
    //.x(function (d) { return x(d.date); })
    .x(function (d) { return x(d.service_date); })
    .y0(function (d) { return y(d.y0); })
    .y1(function (d) { return y(d.y0 + d.y); });

  var svg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // parse
  var graph = d3.csv('mbtadata.csv', function (data) {
    data.forEach(function (d) {
      d.service_date = format.parse(d.service_date);
      d.mode = +d.mode;
      d.route_or_line = +d.route_or_line;
      // one dataset = total_monthly_ridership
      d.total_monthly_ridership = +d.total_monthly_ridership;
      // second dataset = average_monthly_ridership
      d.average_monthly_ridership = +d.average_monthly_ridership;
    });

    var layers = stack(nest.entries(data));

    //x.domain(d3.extent(data, function (d) { return d.date; }));
    x.domain(d3.extent(data, function (d) { return d.service_date; }));
    y.domain([0, d3.max(data, function (d) { return d.y0 + d.y; })]);

    // svg visualization jstuff
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
        invertedx = invertedx.getMonth() + invertedx.getDate();
        var selected = (d.values);
        for (var k = 0; k < selected.length; k++) {
          //datearray[k] = selected[k].date
          datearray[k] = selected[k].service_date
          datearray[k] = datearray[k].getMonth() + datearray[k].getDate();
        }

        mousedate = datearray.indexOf(invertedx);
        console.log(d.values)
        pro = d.values[mousedate].value;

        d3.select(this)
          .classed("hover", true)
          .attr("stroke", strokecolor)
          .attr("stroke-width", "0.5px"),
          //tooltip.html("<p>" + d.key + "<br>" + pro + "</p>").style("visibility", "visible");
          tooltip.html("<p>" + d.mode + "<br>" + pro + "</p>").style("visibility", "visible");

      })
      .on("mouseout", function (d, i) {
        svg.selectAll(".layer")
          .transition()
          .duration(250)
          .attr("opacity", "1");
        d3.select(this)
          .classed("hover", false)
          //.attr("stroke-width", "0px"), tooltip.html("<p>" + d.key + "<br>" + pro + "</p>").style("visibility", "hidden");
          .attr("stroke-width", "0px"), tooltip.html("<p>" + d.mode + "<br>" + pro + "</p>").style("visibility", "hidden");
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

    d3.select(".chart")
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

function createStackedBar() {
  var svgW = 150;
  var svgH = 150;
  var x_axisLength = 160;
  var x_axispos = 82;

  var svg = d3.select('#graph')
    .append('svg')
    .attr('width', svgW + 800)
    .attr('height', svgH + 100)
    .append('g');
    
  // giving names to the different vars to the csv data
  var dataset = d3.layout.stack()(['', 'Milk', 'MilkFoam', 'ChocolateSyrup', 'Water'].map(function (coffeeData) {
    return data.map(function (d) {
      return {
        x: d.Coffee,
        y: +d[coffeeData],
        z: coffeeData
      };
    });
  }));

  // yScale to scale data to graph height
  var yScale = d3.scale.linear()
    .domain([0, d3.max(dataset, function (d) {
      return d3.max(d, function (d) {
        return d.y0 + d.y;
      });
    })])
    .range([svgH, 0]);

  // group and bind data
  // d = data value, i = index of rect
  var groups = svg.selectAll('g.Coffee')
    .data(dataset)
    .enter().append('g')
    .attr('class', 'Coffee')
    .style('fill', function (d, i) {
      return colors[i];
    });

  // stacked bar creation
  var rect = groups.selectAll('rect')
    .data(function (d) { return d; })
    .enter();
  rect.append('rect')
    .attr('x', x_axispos) // spaces data by 5px and 30 px from lhs
    .attr('y', function (d) { return 30 + yScale(d.y0 + d.y); }) // aligns data at bottom of chart
    .attr('width', x_axisLength)
    .attr('height', 0)
    .transition()
    .delay(function (d) { return 750 * d.y0; })
    .duration(700)
    .attr('height', function (d) { return yScale(d.y0) - yScale(d.y0 + d.y); });

}