// chart3_bmi_line.js
(function() {
  d3.csv("data/Sleep_And_BodyChange.csv").then(function(data) {
    // Convert numeric columns
    data.forEach(d => {
      d.Sleep_Hours = +d.Sleep_Hours;
      d.BMI = +d.BMI;
    });
    
    // Separate data by gender
    const maleData = data.filter(d => d.Gender === "Male");
    const femaleData = data.filter(d => d.Gender === "Female");
    
    // Group by floored Sleep_Hours and compute average BMI
    function groupBySleep(dataset) {
      let grouped = d3.rollups(
        dataset,
        v => d3.mean(v, d => d.BMI),
        d => Math.floor(d.Sleep_Hours)
      );
      grouped.sort((a, b) => d3.ascending(a[0], b[0]));
      return grouped;
    }
    
    const groupedMale = groupBySleep(maleData);
    const groupedFemale = groupBySleep(femaleData);
    
    // Dimensions and margins
    const width = 500, height = 300;
    const margin = { top: 20, right: 80, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create SVG container
    const svg = d3.select("#chart3")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
    
    // Main group for chart
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Collect all floored Sleep_Hours across both male & female
    const allSleepHours = Array.from(new Set([
      ...groupedMale.map(d => d[0]),
      ...groupedFemale.map(d => d[0])
    ])).sort((a, b) => a - b);
    
    // X scale: 
    //  - domain from min to max floored Sleep_Hours
    //  - range starts at 40 so the first tick is offset from the left edge
    const x = d3.scaleLinear()
      .domain([2.5, d3.max(allSleepHours)])
      .range([2, innerWidth]) // offset of 40 at the start
      .nice();
    
    // Y scale: forced to [23, 31.5]
    const y = d3.scaleLinear()
      .domain([22, 31.5])
      .range([innerHeight, 0])
      .nice();
    
    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      // We set the tick count to the length of allSleepHours for discrete hour ticks
      .call(d3.axisBottom(x).ticks(allSleepHours.length));
    
    // X axis label
    g.append("text")
      .attr("x", (innerWidth) / 2) // center in the new offset range
      .attr("y", innerHeight + 30)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text("Sleep Hours");
    
    // Y ticks every 1.0 from 23.0 to 31.5
    const yTicks = d3.range(23, 32, 1);
    g.append("g")
      .call(d3.axisLeft(y).tickValues(yTicks).tickFormat(d3.format(".1f")))
      .selectAll("text")
      .attr("dx", "-0.8em");
    
    // Y axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text("Average BMI");
    
    // Line generator
    const lineGenerator = d3.line()
      .x(d => x(d[0]))
      .y(d => y(d[1]));
    
    // Male line (red)
    g.append("path")
      .datum(groupedMale)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("d", lineGenerator);
    
    // Female line (blue)
    g.append("path")
      .datum(groupedFemale)
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 2)
      .attr("d", lineGenerator);
    
    // Male circles
    g.selectAll("circle.male-point")
      .data(groupedMale)
      .enter().append("circle")
      .attr("class", "male-point")
      .attr("cx", d => x(d[0]))
      .attr("cy", d => y(d[1]))
      .attr("r", 4)
      .attr("fill", "red");
    
    // Female circles
    g.selectAll("circle.female-point")
      .data(groupedFemale)
      .enter().append("circle")
      .attr("class", "female-point")
      .attr("cx", d => x(d[0]))
      .attr("cy", d => y(d[1]))
      .attr("r", 4)
      .attr("fill", "blue");
    
    // Legend
    // Shift legend further to the right, and space items so text doesn't overlap circles
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right + 20},${margin.top})`);
    
    // Male legend
    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 5)
      .attr("fill", "red");
    legend.append("text")
      .attr("x", 20) // further to the right
      .attr("y", 0)
      .attr("dy", "0.35em")
      .text("Male")
      .attr("font-size", "12px");
    
    // Female legend
    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", 20)
      .attr("r", 5)
      .attr("fill", "blue");
    legend.append("text")
      .attr("x", 28)
      .attr("y", 20)
      .attr("dy", "0.35em")
      .text("Female")
      .attr("font-size", "12px");
    
  }).catch(function(error) {
    console.error("Error loading CSV:", error);
  });
})();
