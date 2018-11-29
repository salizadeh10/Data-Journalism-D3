// Set the area and dimenstions of the chart
let width = parseInt(d3.select("#scatter").style("width"));
let height = width - width / 8;
let margin = 30;
let labelArea = 110;
let tPadBot = 50;
let tPadLeft = 50;

// Set the raduis of circles with state abbrevation appearing on the chart
let circRadius = 12;

// Setup svg
let svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart");

//-------      Define X-axis lables -------------------------
svg.append("g").attr("class", "xAxisText");
let xAxisText = d3.select(".xAxisText");

// give xAxisText transformation property to places it at the bottom
function refreshXAxis() {
  xAxisText.attr(
    "transform","translate(" +((width - labelArea) / 2 + labelArea) + ", " +(height - margin - tPadBot) + ")"
  );
}
refreshXAxis();

// setup the text for each x-axis lable, Poverty, Age, and Income
xAxisText.append("text")
  .attr("y", -26)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)");

xAxisText.append("text")
  .attr("y", 0)
  .attr("data-name", "age")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Age (Median)");

xAxisText.append("text")
  .attr("y", 26)
  .attr("data-name", "income")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Household Income (Median)");

//-------      Define Y-axis lables -------------------------

let leftTextX = margin + tPadLeft;
let leftTextY = (height + labelArea) / 2 - labelArea;

// append label group for the y-axis
svg.append("g").attr("class", "yAxisText");

// yAxisText will allows us to select the group without excess code.
let yAxisText = d3.select(".yAxisText");

// nest the group's transform attr in a function to make changing it on window change an easy operation.
function refreshYAxis() {
  yAxisText.attr("transform","translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)");
}
refreshYAxis();

// setup text for y-axis, Obesity, Smokings, and Lack of Healthcare
yAxisText.append("text")
  .attr("y", -26)
  .attr("data-name", "obesity")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Obesity (%)");

yAxisText.append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");

yAxisText.append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");

// Import our csv file

d3.csv("assets/data/data.csv").then(function(censusData) {
  // call function to display the chart
  dataVisualization(censusData);
});

// Function to handle all changes to the axises and reorient the chart based on chosen y and x axis
function dataVisualization(data) {
  
  // setup the default axis
  let chosenXAxis = "poverty";
  let chosenYAxis = "obesity";

  //  tooltip 
  let toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([40, -60])
    .html(function(d) {
      console.log(d)
      // x key

      let theX;
      let state = "<div>" + d.state + "</div>";
      let theY = "<div>" + chosenYAxis + ": " + d[chosenYAxis] + "%</div>";
      
      if (chosenXAxis === "poverty") {
        theX = "<div>" + chosenXAxis + ": " + d[chosenXAxis] + "%</div>";
      }
      else {
        
        theX = "<div>" + chosenXAxis + ": " + parseFloat(d[chosenXAxis]) + "</div>";
      }
      
      return state + theX + theY;
    });
    
  // Call the toolTip function.
  svg.call(toolTip);

  // change the min and max for x scale
  function xMinMaxScale() {
    xMinScale = d3.min(data, function(d) {
      return parseFloat(d[chosenXAxis]) * 0.90;
    });

    xMaxScale = d3.max(data, function(d) {
      return parseFloat(d[chosenXAxis]) * 1.10;
    });
  }

  // change the min and max scale for y
  function yMinMaxScale() {
    yMinScale = d3.min(data, function(d) {
      return parseFloat(d[chosenYAxis]) * 0.90;
    });

    yMaxScale = d3.max(data, function(d) {
      return parseFloat(d[chosenYAxis]) * 1.10;
    });
  }

  // change label text when clicked.
  function labelChange(axis, clickedText) {
    // Switch the currently active to inactive.
    d3.selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    // Switch the text just clicked to active.
    clickedText.classed("inactive", false).classed("active", true);
  };

  
  //Grab the min and max values of x and y.
  xMinMaxScale();
  yMinMaxScale();

  // Define x and y scales.
  let xScale = d3.scaleLinear()
    .domain([xMinScale, xMaxScale])
    .range([margin + labelArea, width - margin]);
  let yScale = d3.scaleLinear()
    .domain([yMinScale, yMaxScale])
    .range([height - margin - labelArea, margin]);

  // create the axes
  let xAxis = d3.axisBottom(xScale);
  let yAxis = d3.axisLeft(yScale);

  // Determine x and y tick counts based on page width
  function tickCount() {
    if (width <= 500) {
      xAxis.ticks(5);
      yAxis.ticks(5);
    }
    else {
      xAxis.ticks(10);
      yAxis.ticks(10);
    }
  };

  tickCount();

  // Append the axes in group elements.
  svg.append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height - margin - labelArea) + ")");

  svg.append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + labelArea) + ", 0)");

  // Create the circlesGroup
  let circlesGroup = svg.selectAll("g ")
    .data(data)
    .enter();

  
  circlesGroup
    .append("circle")
    .attr("cx", function(d) {
      return xScale(d[chosenXAxis]);
    })
    .attr("cy", function(d) {
      return yScale(d[chosenYAxis]);
    })
    .attr("r", circRadius)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    });
    

  // Place the state abbreviations in the center of dots.
  circlesGroup
    .append("text")
    .text(function(d) {
      return d.abbr;
    })
    
    .attr("dx", function(d) {
      return xScale(d[chosenXAxis]);
    })
    .attr("dy", function(d) {
      return yScale(d[chosenYAxis]) + circRadius / 2.5;
    })
    .attr("font-size", circRadius)
    .attr("class", "stateText")
    // Hover Rules
    .on("mouseover", function(d) {
      toolTip.show(d, this);
      // Highlight the state circle's border
      d3.select(this).style("stroke", "black");
    })
    .on("mouseout", function(d) {
      toolTip.hide(d);
      d3.select(this).style("stroke", "none");
    });

  // Select all axis text and add this d3 click event.
  d3.selectAll(".aText").on("click", function() {
    let self = d3.select(this);

    if (self.classed("inactive")) {
      // Grab the name and axis saved in label.
      let axis = self.attr("data-axis");
      let name = self.attr("data-name");

      // When x is the saved axis, execute this:
      if (axis === "x") {
        chosenXAxis = name;
        // Change the min and max of the x-axis
        xMinMaxScale();

        // Update the domain of x.
        xScale.domain([xMinScale, xMaxScale]);

        // update the xAxis.
        svg.select(".xAxis").transition().duration(400).call(xAxis);

        // update the location of the state circles.
        d3.selectAll("circle").each(function() {
          
          d3.select(this)
            .transition().attr("cx", function(d) {return xScale(d[chosenXAxis]); })
            .duration(300);
        });

        // change the location of the state texts, too.
        d3.selectAll(".stateText").each(function() {
          
          d3.select(this).transition().attr("dx", function(d) {
              return xScale(d[chosenXAxis]);
            })
            .duration(300);
        });

        // change the classes of the last active label and the clicked label.
        labelChange(axis, self);
      }
      else {
        // When y is the saved axis, execute this:
        // Make chosenYAxis the same as the data name.
        chosenYAxis = name;

        // Change the min and max of the y-axis.
        yMinMaxScale();

        // Update the domain of y.
        yScale.domain([yMinScale, yMaxScale]);

        // Update Y Axis
        svg.select(".yAxis").transition().duration(300).call(yAxis);

        // update the location of the state circles.
        d3.selectAll("circle").each(function() {
          // Each state circle gets a transition for it's new attribute.

          d3 .select(this).transition().attr("cy", function(d) {
              return yScale(d[chosenYAxis]);
            })
            .duration(400);
        });

        // change the location of the state texts
        d3.selectAll(".stateText").each(function() {
          //give each state text the same motion tween as the matching circle.
          d3.select(this).transition().attr("dy", function(d) {
              return yScale(d[chosenYAxis]) + circRadius / 3;
            })
            .duration(400);
        });

        // change the classes of the last active label and the clicked label.
        labelChange(axis, self);
      }
    }
  });

  // Mobile Responsive
  d3.select(window).on("resize", resize);

  function resize() {
    // Redefine the width, height and leftTextY 
    width = parseInt(d3.select("#scatter").style("width"));
    height = width - width / 3.9;
    leftTextY = (height + labelArea) / 2 - labelArea;

    // Apply the width and height to the svg canvas.
    svg.attr("width", width).attr("height", height);

    // Change the xScale and yScale ranges
    xScale.range([margin + labelArea, width - margin]);
    yScale.range([height - margin - labelArea, margin]);

    // update the axes (and the height of the x-axis)
    svg
      .select(".xAxis")
      .call(xAxis)
      .attr("transform", "translate(0," + (height - margin - labelArea) + ")");

    svg.select(".yAxis").call(yAxis);

    // Update the ticks on each axis.
    tickCount();

    // Update the labels.
    refreshXAxis();
    refreshYAxis
();

    // update the location and radius of the state circles.
    d3
      .selectAll("circle")
      .attr("cy", function(d) {
        return yScale(d[chosenYAxis]);
      })
      .attr("cx", function(d) {
        return xScale(d[chosenXAxis]);
      })
      .attr("r", function() {
        return circRadius;
      });

    // change the location and size of the state texts
    d3
      .selectAll(".stateText")
      .attr("dy", function(d) {
        return yScale(d[chosenYAxis]) + circRadius / 3;
      })
      .attr("dx", function(d) {
        return xScale(d[chosenXAxis]);
      })
      .attr("r", circRadius / 3);
  }
}