document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 Blood Pressure Visualization is initializing...");

    function waitForElements() {
        const sleepSlider = document.getElementById("sleep-slider");
        const bpValue = document.getElementById("bp-value");
        const svgOverlay = document.getElementById("svg-overlay");
        const genderInputs = document.querySelectorAll("input[name='gender']");

        if (!sleepSlider || !bpValue || !svgOverlay || genderInputs.length === 0) {
            console.warn("⏳ Waiting for Blood Pressure elements...");
            setTimeout(waitForElements, 300);
            return;
        }

        console.log("Blood Pressure elements found, initializing...");
        initializeBloodPressureVisualization();
    }

    waitForElements();
});

function initializeBloodPressureVisualization() {
    const heart = document.querySelector(".heart");
    const genderInputs = document.querySelectorAll("input[name='gender']");
    const sleepSlider = document.getElementById("sleep-slider");
    const sleepValue = document.getElementById("sleep-value");
    const bpValue = document.getElementById("bp-value");
    const svgOverlay = d3.select("#svg-overlay");

    let aggregatedBPData = [];
    let parsedData = [];

    d3.csv("data/processed_blood_pressure_data.csv").then(function (data) {
        if (!data || data.length === 0) {
            console.error("CSV loaded but is empty!");
            return;
        }
        console.log("CSV Loaded Successfully!", data);

        aggregatedBPData = data.map(d => ({
            Gender: d.Gender,
            SleepDuration: +d["Sleep Duration"],
            Systolic: +d.Systolic,
            Diastolic: +d.Diastolic
        }));

        adjustSVGSize();
        updateVisualization();
    }).catch(error => console.error("Error loading CSV:", error));

    // For Heart Animation and data 
    d3.csv("data/processed-heart-rate-data.csv").then(function (data) {
        parsedData = data.map(d => ({
            Gender: d.Gender,
            SleepDuration: +d["SleepDuration"],
            bpm: +d["Bpm"]
        }));
        updateHeart()
    });

    function updateHeart() {
        const gender = document.querySelector("input[name='gender']:checked").value;
        const sleepHours = sleepSlider.value;
        const heart_rate_box = document.getElementById("heart-rate");
        let match = parsedData.find(d =>
            d.Gender === gender && d.SleepDuration == sleepHours
        );
       
        if(match === undefined) {
            console.log(parsedData)
            console.log(gender)
            console.log(sleepHours)
            console.log("Missing Heart data!")
            heart.style.animationDuration = `1s`;
            heart_rate_box.innerText = `Missing Data :(`;
        }else{
            heart.style.animationDuration = `${60 / match.bpm}s`;
            console.log(60 / match.bpm)
            heart_rate_box.innerText = `Heart Rate: ${match.bpm} BPM`;
        }
    }
    // End of for heart data and animation

    function getBloodPressure(gender, sleep) {
        sleep = Math.round(sleep * 4) / 4;

        let match = aggregatedBPData.find(d =>
            d.Gender === gender &&
            d.SleepDuration === sleep
        );

        return match ? `${Math.round(match.Systolic)}/${Math.round(match.Diastolic)}` : null;
    }

    function adjustSVGSize() {
        const humanImage = document.getElementById("human-image");
        const svgElement = document.getElementById("svg-overlay");

        svgElement.setAttribute("width", humanImage.clientWidth);
        svgElement.setAttribute("height", humanImage.clientHeight);

        drawBloodVessels();
    }

    function drawBloodVessels() {
        svgOverlay.selectAll("line").remove();

        const imgWidth = document.getElementById("human-image").clientWidth;
        const imgHeight = document.getElementById("human-image").clientHeight;

        let veins = [
            { x1: 50, y1: 10, x2: 50, y2: 42 },
            { x1: 50, y1: 42, x2: 46, y2: 72 },
            { x1: 50, y1: 42, x2: 54, y2: 72 },
            { x1: 46, y1: 72, x2: 46, y2: 90 },
            { x1: 54, y1: 72, x2: 54, y2: 90 }
        ].map(d => ({
            x1: (d.x1 / 100) * imgWidth,
            y1: (d.y1 / 100) * imgHeight,
            x2: (d.x2 / 100) * imgWidth,
            y2: (d.y2 / 100) * imgHeight
        }));

        let arteries = veins.map(vessel => ({
            x1: vessel.x1 + 5, y1: vessel.y1, x2: vessel.x2 + 5, y2: vessel.y2
        }));

        arteries.forEach(vessel => {
            svgOverlay.append("line")
                .attr("x1", vessel.x1)
                .attr("y1", vessel.y1)
                .attr("x2", vessel.x2)
                .attr("y2", vessel.y2)
                .attr("stroke", "red")
                .attr("stroke-width", 7)
                .attr("stroke-dasharray", "30, 15")
                .attr("stroke-dashoffset", "60")
                .attr("class", "blood-flow artery")
                .style("animation", "none");
        });

        veins.forEach(vessel => {
            svgOverlay.append("line")
                .attr("x1", vessel.x1)
                .attr("y1", vessel.y1)
                .attr("x2", vessel.x2)
                .attr("y2", vessel.y2)
                .attr("stroke", "blue")
                .attr("stroke-width", 5)
                .attr("stroke-dasharray", "40, 20")
                .attr("stroke-dashoffset", "-80")
                .attr("class", "blood-flow vein")
                .style("animation", "none");
        });
    }

    function updateVisualization() {
        const gender = document.querySelector("input[name='gender']:checked").value;
        const sleep = Math.round(Number(sleepSlider.value) * 4) / 4;

        sleepValue.textContent = sleep;

        const bpText = getBloodPressure(gender, sleep);

        if (bpText === null) {
            bpValue.textContent = "No Data";
            d3.selectAll(".blood-flow").style("animation", "none");
            return;
        }

        bpValue.textContent = bpText;

        const [systolic, diastolic] = bpText.split("/");

        bpValue.innerHTML = `<span style="color: red; font-weight: bold;">${systolic}</span> / <span style="color: #2F4F4F; font-weight: bold;">${diastolic}</span>`;

        let systolicFlowSpeed, diastolicFlowSpeed;

        if (systolic < 120) {
            systolicFlowSpeed = 6;
        } else if (systolic >= 120 && systolic < 130) {
            systolicFlowSpeed = 3;
        } else {
            systolicFlowSpeed = 1.5;
        }

        if (diastolic < 80) {
            diastolicFlowSpeed = 6;
        } else if (diastolic >= 80 && diastolic < 85) {
            diastolicFlowSpeed = 3;
        } else {
            diastolicFlowSpeed = 1.5;
        }

        d3.selectAll(".artery")
            .style("animation", `flow-animation ${systolicFlowSpeed}s infinite linear`);

        d3.selectAll(".vein")
            .style("animation", `reverse-flow-animation ${diastolicFlowSpeed}s infinite linear`);
    }

    genderInputs.forEach(input => {
        input.addEventListener("change", updateVisualization);
    });

    sleepSlider.addEventListener("input", updateVisualization);
    window.addEventListener("resize", adjustSVGSize);
    genderInputs.forEach(input => {
        input.addEventListener("change", updateHeart);
    });

    sleepSlider.addEventListener("input", updateHeart);
}
