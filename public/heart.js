document.addEventListener("DOMContentLoaded", function () {

    function waitForElements() {}
    const heart = document.querySelector(".heart");
    const genderInputs = document.querySelectorAll("input[name='gender']");
    const sleepSlider = document.getElementById("sleep-slider");
    
    if (!heart || !genderInputs || !sleepSlider){
        console.log(
            "Some aint right here in the heart!"
        )
        return
    }
    console.log("Aight the heart the starting up!")
    startingHeart();
});

function startingHeart() {
    const heart = document.querySelector(".heart");
    const genderInputs = document.querySelectorAll("input[name='gender']");
    const sleepSlider = document.getElementById("sleep-slider");
    let parsedData = []
    
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

    genderInputs.forEach(input => {
        input.addEventListener("change", updateHeart);
    });

    sleepSlider.addEventListener("input", updateHeart);
}

