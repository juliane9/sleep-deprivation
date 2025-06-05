// chart1_stress_bar.js
(function() {
  d3.csv("data/Sleep_And_BodyChange.csv").then(function(data) {
    // Convert relevant columns to numbers
    data.forEach(d => {
      d.Sleep_Hours = +d.Sleep_Hours;
      d.Stress_Level = +d.Stress_Level;
    });

    // Group data by the floored Sleep_Hours and compute the average Stress_Level for each group
    const grouped = d3.rollups(
      data,
      v => d3.mean(v, d => d.Stress_Level),
      d => Math.floor(d.Sleep_Hours)
    );
    
    // Sort grouped data in ascending order by the integer Sleep_Hours
    grouped.sort((a, b) => d3.ascending(a[0], b[0]));

    const width = 500, height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select("#chart1")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Create a group for the chart's content, shifted by margins
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale: use a band scale with discrete integer Sleep_Hours values
    const x = d3.scaleBand()
      .domain(grouped.map(d => d[0]))
      .range([0, innerWidth])
      .padding(0.2);

    // Y scale: from 0 up to the max average Stress_Level
    const y = d3.scaleLinear()
      .domain([0, d3.max(grouped, d => d[1])])
      .range([innerHeight, 0])
      .nice();

    // Append X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "middle");

    // X axis label
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 30)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text("Sleep Hours");

    // Append Y axis and shift tick labels to the left
    g.append("g")
      .call(d3.axisLeft(y).ticks(5))
      .selectAll("text")
      .attr("dx", "-0.5em");

    // Y axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -35)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text("Average Stress Level");

    // Draw the bars
    g.selectAll("rect")
      .data(grouped)
      .enter().append("rect")
      .attr("x", d => x(d[0]))
      .attr("y", d => y(d[1]))
      .attr("width", x.bandwidth())
      .attr("height", d => innerHeight - y(d[1]))
      .attr("fill", "orange");

    // Compute points at the top center of each bar
    const lineData = grouped.map(d => ({
      hour: d[0],
      stress: d[1],
      x: x(d[0]) + x.bandwidth() / 2,
      y: y(d[1])
    }));

    // Create a line generator
    const lineGenerator = d3.line()
      .x(d => d.x)
      .y(d => d.y);

    // Append the line path connecting the points
    g.append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("d", lineGenerator);

    // Draw circles at each point
    g.selectAll("circle.line-point")
      .data(lineData)
      .enter().append("circle")
      .attr("class", "line-point")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 4)
      .attr("fill", "black");

  }).catch(function(error) {
    console.error("Error loading CSV:", error);
  });
})();
