const countryCodes = {
    US: "USA",
    JP: "JPN",
    NZ: "NZL",
    ID: "IDN",
    AT: "AUT",
    IT: "ITA",
    ZA: "ZAF",
    RU: "RUS",
    LV: "LVA",
    EG: "EGY",
    LU: "LUX",
    AU: "AUS",
    HU: "HUN",
    SE: "SWE",
    BR: "BRA",
    MX: "MEX",
    TR: "TUR",
    IL: "ISR",
    PT: "PRT",
    GR: "GRC",
    MA: "MAR",
    BG: "BGR",
    AR: "ARG",
    VN: "VNM",
    TW: "TWN",
    KR: "KOR",
    NO: "NOR",
    SK: "SVK",
    PL: "POL",
    PH: "PHL",
    MY: "MYS",
    FI: "FIN",
    CR: "CRI",
    CL: "CHL",
    CN: "CHN",
    RO: "ROU",
    ES: "ESP",
    HR: "HRV",
    DE: "DEU",
    NL: "NLD",
    EC: "ECU",
    UA: "UKR",
    CA: "CAN",
    SG: "SGP",
    FR: "FRA",
    HK: "HKG",
    CZ: "CZE",
    IN: "IND",
    BE: "BEL",
    PE: "PER",
    CO: "COL",
    DK: "DNK",
    EE: "EST",
    CY: "CYP",
    GB: "GBR",
    TH: "THA",
    AE: "ARE",
    SA: "SAU",
    CH: "CHE",
    LT: "LTU",
    IE: "IRL",
};
const loadSleepByCountryMap = () => {
    // Select the container
    const container = d3.select("#sleep-by-country-map");
    const containerNode = container.node();
    const containerWidth = containerNode.getBoundingClientRect().width;
    const containerHeight = containerWidth * 0.6; // Maintain aspect ratio

    // Create SVG
    const svg = d3
        .select("#sleep-by-country-map-svg")
        .attr("width", "100%")
        .attr("height", containerHeight)
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Add a group g to hold the map for zooming/panning
    const g = svg.append("g");

    // Set map projection
    const scale = containerWidth * 0.2;
    const projection = d3
        .geoNaturalEarth1()
        .translate([containerWidth / 2, containerHeight / 2])
        .scale(scale);
    const path = d3.geoPath().projection(projection);

    // Create tooltip
    const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "sleep-by-country-map-tooltip")
        .style("position", "absolute")
        .style("background", "white")
        .style("padding", "5px")
        .style("border", "1px solid black")
        .style("border-radius", "5px")
        .style("pointer-events", "none") // Prevents flickering
        .style("opacity", 0);

    // Define zoom behavior
    const zoom = d3
        .zoom()
        .scaleExtent([1, 8]) // Min zoom: 1x, Max zoom: 8x
        .translateExtent([
            [0, 0],
            [containerWidth, containerHeight],
        ]) // Pan limits
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    // Apply zoom behavior to SVG
    svg.call(zoom);

    // Load map & data
    Promise.all([
        d3.json(
            "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
        ),
        d3.json("data/country_sleep_data.json"),
    ]).then(([world, data]) => {
        const sleepData = {};
        data.forEach((d) => {
            if (d.country) {
                let code = d.country.toUpperCase();
                let mappedCode = countryCodes[code] || code;
                sleepData[mappedCode] = +d.avg_duration / 3600; // Convert seconds to hours
            }
        });

        // Adjust color scale based on min/max values
        const minSleep = d3.min(Object.values(sleepData)) || 5;
        const maxSleep = d3.max(Object.values(sleepData)) || 9;
        const colorScale = d3
            .scaleSequential(d3.interpolateBlues)
            .domain([minSleep, maxSleep]);

        // Draw countries inside the `g` group (so zoom affects them)
        g.selectAll("path")
            .data(world.features)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("fill", (d) => {
                const country = d.id;
                return sleepData[country]
                    ? colorScale(sleepData[country])
                    : "#ccc";
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
            .on("mouseover", function (event, d) {
                const country = d.id;
                const hours = sleepData[country]
                    ? sleepData[country].toFixed(2) + " hrs"
                    : "No data";

                d3.select(this)
                    .attr("stroke", "#000")
                    .attr("stroke-width", 1.5);

                tooltip
                    .style("opacity", 1)
                    .html(`<strong>${d.properties.name}</strong>: ${hours}`);
            })
            .on("mousemove", function (event) {
                tooltip
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 20 + "px");
            })
            .on("mouseout", function () {
                d3.select(this)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 0.5);
                tooltip.style("opacity", 0);
            });
    });
};
const loadSleepByCountyMap = () => {
    // Get the container dimensions
    const container = d3.select("#sleep-by-county-map");
    const containerNode = container.node();
    const containerWidth = containerNode.getBoundingClientRect().width;
    const containerHeight = containerWidth * 0.6; // Set a height proportional to width with minimum

    // Create SVG with responsive dimensions
    const svg = d3
        .select("#sleep-by-county-map-svg")
        .attr("width", "100%")
        .attr("height", containerHeight)
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g");
    // Define zoom behavior
    const zoom = d3
        .zoom()
        .scaleExtent([1, 8]) // Min zoom: 1x, Max zoom: 8x
        .translateExtent([
            [0, 0],
            [containerWidth, containerHeight],
        ]) // Pan limits
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    // Apply zoom behavior to SVG
    svg.call(zoom);

    // Calculate scale based on container width
    const scale = containerWidth * 1.3; // Adjust multiplier as needed

    // Create responsive projection
    const projection = d3
        .geoAlbersUsa()
        .translate([containerWidth / 2, containerHeight / 2])
        .scale(scale);
    const path = d3.geoPath().projection(projection);

    // Load county map
    Promise.all([
        d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json"),
        d3.json("data/county_sleep_data.json"), // Use the updated JSON file
    ]).then(([topoData, sleepData]) => {
        const counties = topojson.feature(topoData, topoData.objects.counties);

        // Define color scale (Blues for better sleep, Reds for worse sleep)
        const colorScale = d3
            .scaleSequential(d3.interpolateReds)
            .domain([20, 50]); // Adjust domain range based on actual data

        g.selectAll("path")
            .data(counties.features)
            .enter()
            .append("path")
            .attr("class", "county")
            .attr("d", path)
            .style("fill", (d) => {
                const fips = d.id.toString().padStart(5, "0"); // Ensure FIPS is a 5-digit string
                const countyData = sleepData[fips]; // Get data

                return countyData
                    ? colorScale(countyData["SLEEP_AdjPrev"])
                    : "#ccc"; // Default gray if no data
            })
            .style("stroke", "white")
            .on("mouseover", function (event, d) {
                const fips = d.id.toString().padStart(5, "0");
                const countyData = sleepData[fips];

                if (!countyData) {
                    d3.select("body")
                        .append("div")
                        .attr("class", "sleep-by-county-map-tooltip")
                        .style("position", "absolute")
                        .style("background", "white")
                        .style("padding", "5px")
                        .style("border", "1px solid black")
                        .html(
                            `<strong>Unknown County</strong><br>No Data Available`
                        )
                        .style("left", event.pageX + 5 + "px")
                        .style("top", event.pageY + 5 + "px");
                    return;
                }

                d3.select(this).style("fill", "orange");

                // Show tooltip with correct state and county names
                d3.select("body")
                    .append("div")
                    .attr("class", "sleep-by-county-map-tooltip")
                    .style("position", "absolute")
                    .style("background", "white")
                    .style("padding", "5px")
                    .style("border", "1px solid black")
                    .html(
                        `<strong>${countyData["CountyName"]}, ${countyData["StateDesc"]}</strong><br>Prevalence of Insufficient Sleep: ${countyData["SLEEP_AdjPrev"]}%`
                    )
                    .style("left", event.pageX + 5 + "px")
                    .style("top", event.pageY + 5 + "px");
            })
            .on("mouseout", function () {
                d3.select(this).style("fill", (d) => {
                    const fips = d.id.toString().padStart(5, "0");
                    const countyData = sleepData[fips];
                    return countyData
                        ? colorScale(countyData["SLEEP_AdjPrev"])
                        : "#ccc";
                });

                d3.select(".sleep-by-county-map-tooltip").remove();
            });
    });
};
