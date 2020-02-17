// Homework 5: Experimenting with Color
// Emilee Reichenbach 

// credit to structure of the stacked bar chart,
// data import, and legend set-up:
// http://duspviz.mit.edu/d3-workshop/intro-to-d3/
var coffeeData = [];
d3.csv('coffeeportions.csv', function (d) {
  return {
    Coffee: d.Coffee,
    Espresso: +d.Espresso,
    Milk: +d.Milk,
    MilkFoam: +d.MilkFoam,
    ChocolateSyrup: +d.ChocolateSyrup,
    Water: +d.Water
  };
}, function (error, rows) {
  // base/original colors
  var colors = ["#73573F", "#F2ECEB", "#D9BEA7", "#592D1D", "#8BBCC0"];
  
  // if a Type of Drink button is changed
  var coffeeButtons = d3.selectAll('[name=coffeeButton]');
  coffeeButtons.on('change', function (d) {
    const selection = this.value;
    data = []
    data.push(changeCoffee(selection, rows));
    d3.select("svg").remove();
    d3.select('.info').selectAll('p').remove();
    d3.select('.info').selectAll('h4').remove();
    d3.select('.info').selectAll('svg').remove();
    var info = getInfo(selection);
    createVisualization(colors);
  });

  // if a Color Scheme button is changed
  var colorButtons = d3.selectAll('[name=color]');
  colorButtons.on('change', function (d) {
    const selection = this.value;
    colors = changeColor(selection);
    d3.select('svg').remove();
    createVisualization(colors);
  });
  data = [rows[0]];
  var startingCoffee = getInfo('Cappuccino');
  getInfo(startingCoffee);
  createVisualization(colors);
});

function createVisualization(colors) {
  // svg base created
  var svgW = 150;
  var svgH = 150;
  var x_axisLength = 160;
  var x_axispos = 82;

  var mugOutline = '#000';

  var svg = d3.select('#graph')
    .append('svg')
    .attr('width', svgW + 800)
    .attr('height', svgH + 100)
    .append('g');

  // portions of coffee mug svg drawing
  // tutorial used: https://www.d3-graph-gallery.com/graph/shape.html
  svg.append('svg')
    .attr('width', 800)
    .attr('height', 200)
    .append('ellipse')
    .attr('cx', 245)
    .attr('cy', 88)
    .attr('rx', 35)
    .attr('ry', 50)
    .style({ 'fill': 'none', 'stroke-width': '10px', 'stroke': mugOutline });

  svg.append('svg')
    .attr('width', 900)
    .attr('height', 950)
    .append('polygon')
    .attr('points', '200,50 200,215 85,215 50,185 50,85 85,50')
    .attr('transform', 'translate(30,230) rotate(-90)')
    .style({ 'stroke': mugOutline, 'stroke-width': '9px', 'fill': '#fff' });

  // giving names to the different vars to the csv data
  var dataset = d3.layout.stack()(['Espresso', 'Milk', 'MilkFoam', 'ChocolateSyrup', 'Water'].map(function (coffeeData) {
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
    .attr('y', function (d) { return 30+yScale(d.y0 + d.y); }) // aligns data at bottom of chart
    .attr('width', x_axisLength)
    .attr('height', 0)
    .transition()
      .delay(function (d) {return 750*d.y0;})
      .duration(700)
      .attr('height', function (d) { return yScale(d.y0) - yScale(d.y0 + d.y); });

  // white percentage text "background"
  rect.append('text')
    .text(function (d) {
      if (d.y != 0) {
        return 100 * d.y + '%';
      } else {
        return null
      }
    })
    .attr('x', x_axisLength - 7)
    .attr('y', function (d) { return ((yScale(d.y0) - yScale(d.y0 + d.y)) / 2) + (35 + yScale(d.y0 + d.y)) })
    .style({'stroke': '#fff', 'stroke-width': '0.35em', 'fill': '#fff', 'text-align': 'center', 'font-weight': '600' });

  // actual percentage text appearing
  rect.append('text')
    .text(function (d) {
      if (d.y != 0) {
        return 100 * d.y + '%';
      } else {
        return null
      }
    })
    .attr('x', x_axisLength - 7)
    .attr('y', function (d) { return ((yScale(d.y0) - yScale(d.y0 + d.y)) / 2) + (35 + yScale(d.y0 + d.y)) })
    .style('fill', '#fff')
    .transition()
    .delay(250)
    .duration(200)
    .style({ 'fill': '#000', 'text-align': 'center', 'font-weight': '600' });

  // legend creation
  var legend = svg.selectAll('legend')
    .data(colors)
    .enter().append('g')
    .attr('class', 'legend')
    .attr('transform', function (d, i) { return 'translate(180,' + i * 30 + ')'; });

  legend.append('rect')
    .attr('y', 20)
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', function (d, i) { return colors[i]; })
    .attr('transform', function (d, i) { return 'translate(140,0)'; })

  legend.append("text")
    .attr("x", svgW + 20)
    .attr("y", 25)
    .attr("dy", ".8em")
    .style("text-anchor", "start")
    .text(function (d, i) {
      switch (i) {
        case 0: return "Espresso";
        case 1: return "Milk";
        case 2: return "Milk Foam";
        case 3: return "Chocolate Syrup";
        case 4: return "Water"
      }
    });

  // portions of coffee mug svg drawing
  // tutorial used: https://www.d3-graph-gallery.com/graph/shape.html
  svg.append('svg')
    .attr('width', 800)
    .attr('height', 800)
    .append('polyline')
    .attr('points', '75 135, 75 190, 120 190')
    .style('fill', '#fff');

  svg.append('svg')
    .attr('width', 800)
    .attr('height', 800)
    .append('polyline')
    .attr('points', '250 145, 250 190, 200 190')
    .style('fill', '#fff');

  svg.append('svg')
    .attr('width', 800)
    .attr('height', 450)
    .append('polygon')
    .attr('points', '200,50 200,215 85,215 50,185 50,85 85,50')
    .attr('transform', 'translate(30,230) rotate(-90)')
    .style({ 'stroke': mugOutline, 'stroke-width': '9px', 'fill': 'none' });
};

// changes the type of drink data shown
function changeCoffee(selection, data) {
  for (var i = 0; i < data.length; i++) {
    if (selection == data[i].Coffee) {
      return data[i];
    }
  }

  return data;
};

// changes the color scheme
function changeColor(selection) {
  if (selection == 'original') {
    return ["#73573F", "#F2ECEB", "#D9BEA7", "#592D1D", "#8BBCC0"];
  } else if (selection == 'gray') {
    return ["#252525", "#f7f7f7", "#cccccc", "#636363", "#969696"];
  } else if (selection == 'bw') {
    return ['url(#diagonal-stripe-3)',
            '#ffffff',
            'url(#circles-3)',
            '#000000',
            'url(#horizontal-stripe-3)'];
  } else if (selection == 'cool') {
    return ["#583C9C", "#2E917E", "#37AE4C", "#9A3191", "#3C5599"];
  } else if (selection == 'warm') {
    return ["#93000B", "#FF9018", "#FAFE5C", "#C36500", "#F53047"];
  } else if (selection == 'pastel') {
    return ["#fbb4ae", "#ccebc5", "#ffffcc", "#decbe4", "b3cde3"];
  } else if (selection == 'bold') {
    return ["#e41a1c", "#4daf4a", "#ffff33", "#984ea3", "#377eb8"];
  } else if (selection == 'colorblind') {
    return ["#662506", "#ec7014", "#fff7bc", "#993404", "#fec44f"];
  } else {
    return ["#73573F", "#F2ECEB", "#D9BEA7", "#592D1D", "#8BBCC0"];
  }
}

// adds Info section data
function getInfo(selection) {
  d3.json('coffeeInfo.json', function(data) {
    data.forEach(i => {
      if (selection == i.type) {
        let text = d3.select('.info');
        text.append('h4')
          .attr('class', 'title')
          .text(i.name);
        text.append('p')
          .attr('class', 'desc')
          .text(i.desc);
        text.append('p')
          .attr('class', 'ing')
          .text(i.ing);
        text.append('svg')
          .attr('width', 300)
          .attr('height', 225)
          .append('image')
          .attr('xlink:href', i.img)
          .attr('x', 0)
          .attr('y', 0)
          .attr('dy', 0)
          .attr('width', 300)
          .attr('height', 225);
      }
    });
  });
}
  
  // Color Scheme credits:
  // shades of grey scheme (colorbrewer2.org)
  // http://colorbrewer2.org/#type=sequential&scheme=Greys&n=5
  // var colors = ["#252525", "#636363", "#969696", "#cccccc", "#f7f7f7"];

  // cool tones (paletton.com)
  // http://paletton.com/#uid=53N0W0kt+lZlOstrKqzzSiaJidt + http://paletton.com/#uid=52S0l0ku5lZlUsurQqx-5i9Jsds + http://paletton.com/#uid=54D0l0ku5lZlUsurQqx-5i9Jsds
  // var colors = ["#583C9C", "#2E917E", "#37AE4C", "#9A3191", "#3C5599"];

  // warm tones (paletton.com)
  // http://paletton.com/#uid=50B0E0kC3usm-Dzs+BnENoqJHiV + http://paletton.com/#uid=55n0c0kw0uvktA2pHwszbozEkjP + http://paletton.com/#uid=51-0l0kw0uvktA2pHwszbozEkjP
  // var colors = ["#93000B", "#FF9018", "#FAFE5C", "#C36500", "#F53047"];

  // pastel colors (colorbrewer2.org)
  // http://colorbrewer2.org/#type=qualitative&scheme=Pastel1&n=6
  // var colors = ["#fbb4ae", "#ccebc5", "#ffffcc", "#decbe4", "b3cde3"];

  // bold/saturated colors (colorbrewer2.org)
  // var colors = ["#e41a1c", "#4daf4a", "#ffff33", "#984ea3", "#377eb8"];

  // colorblind aware (colorbrewer2.org)
  // http://colorbrewer2.org/#type=sequential&scheme=YlOrBr&n=9
  // var colors = ["#662506", "#ec7014", "#fff7bc", "#993404", "#fec44f"];

// styling of text elements
d3.select('h2').style({'font-family': 'Arial', 'font-size': '30px', 'font-weight': '600'});
d3.select('body').style({'font-family': 'Arial', 'font-size': '14px'});
d3.select('a').style({'color': '#594336', 'text-decoration': 'none'});
d3.select('.coffeeSelector').style({'float': 'left', 'margin': '0', 'padding': '2em'});
d3.select('.colorSelector').style({ 'float': 'left', 'margin': '0', 'padding': '2em' });
d3.select('.info').style({ 'float': 'left', 'margin': '0', 'padding': '2em', 'max-width': '450px' });
d3.select('#graph').selectAll('rect').style('background','#000');
d3.select('footer').style({'height': '50px', 'padding-left': '110px'})
d3.select('.container').style({'padding-left': '20px', 'min-height': '100%', 'margin': '0 auto -50px'})