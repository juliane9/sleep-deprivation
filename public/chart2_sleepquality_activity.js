// chart2_sleepquality_activity.js
(function() {
  d3.csv("data/Sleep_And_BodyChange.csv").then(function(data) {
    // 1) Parse both columns as numbers (Sleep_Quality_Score & Physical_Activity_Level)
    data.forEach(d => {
      d.Sleep_Quality_Score = +d.Sleep_Quality_Score;
      d.Physical_Activity_Level = +d.Physical_Activity_Level;
    });

    // 2) Group by Sleep_Quality_Score -> median Physical_Activity_Level
    let grouped = d3.rollups(
      data,
      v => d3.median(v, d => d.Physical_Activity_Level),
      d => d.Sleep_Quality_Score
    );
    // Filter out groups with Sleep_Quality_Score of 0
    grouped = grouped.filter(d => d[0] !== 0);
    
    // Sort ascending by numeric Sleep_Quality_Score
    grouped.sort((a, b) => d3.ascending(a[0], b[0]));

    const scores = grouped.map(d => d[0]); // numeric array of Sleep_Quality_Score
    const width = 500, height = 300;
    
    // We'll use a bit more margin for the Y-axis
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select("#chart2")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Create a group for the chart's content, shifted by margins
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // 3) X scale: discrete categories from sorted numeric scores
    const x = d3.scaleBand()
      .domain(scores) 
      .range([0, innerWidth])
      .padding(0.2);

    // 4) Y scale: from 0 up to max median Physical_Activity_Level
    const y = d3.scaleLinear()
      .domain([0, d3.max(grouped, d => d[1])])
      .range([innerHeight, 0])
      .nice();

    // 5) Append X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(d => d))
      .selectAll("text") 
      .style("text-anchor", "middle");

    // X axis label
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 30)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text("Sleep Quality Score");

    // 6) Append Y axis and shift tick labels to the left
    g.append("g")
      .call(d3.axisLeft(y).ticks(5))
      .selectAll("text")
      .attr("dx", "-0.5em");

    // Y axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text("Average Physical Activity Level");

    // 7) Draw the bars
    g.selectAll("rect")
      .data(grouped)
      .enter().append("rect")
      .attr("x", d => x(d[0]))
      .attr("y", d => y(d[1]))
      .attr("width", x.bandwidth())
      .attr("height", d => innerHeight - y(d[1]))
      .attr("fill", "steelblue");

    // 8) Compute points at the top center of each bar
    const lineData = grouped.map(d => ({
      score: d[0],
      avgActivity: d[1],
      x: x(d[0]) + x.bandwidth() / 2,
      y: y(d[1])
    }));

    // 9) Sample one point every 5 bars, and ensure the last point is included
    let sampledLineData = lineData.filter((d, i) => i % 5 === 0);
    if (sampledLineData[sampledLineData.length - 1].score !== lineData[lineData.length - 1].score) {
      sampledLineData.push(lineData[lineData.length - 1]);
    }

    // 10) Create a line generator for the sampled points
    const lineGenerator = d3.line()
      .x(d => d.x)
      .y(d => d.y);

    // Append the line path connecting the sampled points
    g.append("path")
      .datum(sampledLineData)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("d", lineGenerator);

    // 11) Draw circles at each sampled data point
    g.selectAll("circle.trend-point")
      .data(sampledLineData)
      .enter().append("circle")
      .attr("class", "trend-point")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 4)
      .attr("fill", "black");
  }).catch(function(error) {
    console.error("Error loading CSV:", error);
  });
})();
