// chart4_sleepiness_emotion.js
(function() {
  d3.csv("data/Sleep_And_BodyChange.csv").then(function(data) {
    data.forEach(d => {
      d.Sleep_Hours = +d.Sleep_Hours;
      d.Daytime_Sleepiness = +d.Daytime_Sleepiness;
      d.Emotion_Regulation_Score = +d.Emotion_Regulation_Score;
    });

    // Create bins for Sleep_Hours with 5 thresholds
    const binGenerator = d3.bin()
      .domain(d3.extent(data, d => d.Sleep_Hours))
      .thresholds(5);

    const hoursArray = data.map(d => d.Sleep_Hours);
    const bins = binGenerator(hoursArray);

    // For each bin, compute average values and use floor of bin.x0 as label
    const groupedData = bins.map(bin => {
      const binRows = data.filter(d => d.Sleep_Hours >= bin.x0 && d.Sleep_Hours < bin.x1);
      return {
        binLabel: `${Math.floor(bin.x0)}`, // Use only the lower boundary floored
        avgSleepy: d3.mean(binRows, d => d.Daytime_Sleepiness),
        avgEmotion: d3.mean(binRows, d => d.Emotion_Regulation_Score)
      };
    });

    // We want two bars per bin: one for avgSleepy, one for avgEmotion
    const metrics = ["avgSleepy", "avgEmotion"];
    const width = 500, height = 300;

    const svg = d3.select("#chart4")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // X scales: x0 for bins, x1 for metrics within each bin
    const x0 = d3.scaleBand()
      .domain(groupedData.map(d => d.binLabel))
      .range([50, width - 50])
      .padding(0.2);

    const x1 = d3.scaleBand()
      .domain(metrics)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    // Y scale: from 0 up to max of both metrics
    const y = d3.scaleLinear()
      .domain([0, d3.max(groupedData, d => Math.max(d.avgSleepy || 0, d.avgEmotion || 0))])
      .nice()
      .range([height - 50, 50]);

    // Append X axis
    svg.append("g")
      .attr("transform", `translate(0,${height - 50})`)
      .call(d3.axisBottom(x0));

    // Append Y axis and shift its tick labels to the left
    svg.append("g")
      .attr("transform", "translate(50,0)")
      .call(d3.axisLeft(y).ticks(6))  // Only 6 ticks on the Y-axis
      .selectAll("text")
      .attr("dx", "-0.5em");

    // X axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text("Sleep Hours");

    // Y axis label - shifted further left
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text("Average Score");

    // Draw bars for each group and metric
    svg.selectAll("g.layer")
      .data(groupedData)
      .enter().append("g")
      .attr("class", "layer")
      .attr("transform", d => `translate(${x0(d.binLabel)},0)`)
      .selectAll("rect")
      .data(d => metrics.map(key => ({ key: key, value: d[key] })))
      .enter().append("rect")
      .attr("x", d => x1(d.key))
      .attr("y", d => isNaN(d.value) ? y(0) : y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", d => isNaN(d.value) ? 0 : (height - 50 - y(d.value)))
      .attr("fill", d => d.key === "avgSleepy" ? "purple" : "red");

    // Optional legend
    const legend = svg.selectAll(".legend")
      .data(metrics)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0,${50 + i * 20})`);

    legend.append("rect")
      .attr("x", width - 150)
      .attr("y", -50)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", d => d === "avgSleepy" ? "purple" : "red");

    legend.append("text")
      .attr("x", width - 70)
      .attr("y", -40)
      .attr("dy", "0.35em")
      .text(d => d === "avgSleepy" ? "Daytime Sleepiness" : "Emotion Regulation");
  });
})();
