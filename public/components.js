class SleepByCountyMap extends HTMLElement {
    connectedCallback() {
        fetch("sleep-by-county-map.html")
            .then((response) => response.text())
            .then((data) => {
                this.innerHTML = data;
            })
            .then(() => {
                loadSleepByCountyMap();
            });
    }
}
customElements.define("sleep-by-county-map", SleepByCountyMap);

class SleepByCountryMap extends HTMLElement {
    connectedCallback() {
        fetch("sleep-by-country-map.html")
            .then((response) => response.text())
            .then((data) => {
                this.innerHTML = data;
            })
            .then(() => {
                loadSleepByCountryMap();
            });
    }
}
customElements.define("sleep-by-country-map", SleepByCountryMap);

class BloodPressureComponent extends HTMLElement {
    connectedCallback() {
        fetch("blood-pressure.html")
            .then((response) => response.text())
            .then((html) => {
                this.innerHTML = html;
                const script = document.createElement("script");
                script.src = "blood-pressure.js";
                script.defer = true;
                document.body.appendChild(script);
            })
            .catch((error) =>
                console.error("Error loading blood-pressure component:", error)
            );
    }
}
customElements.define("blood-pressure", BloodPressureComponent);

class SleepImpactComponent extends HTMLElement {
    connectedCallback() {
        fetch("sleep-impact.html")
            .then((response) => response.text())
            .then((html) => {
                this.innerHTML = html;
                this.querySelectorAll("script").forEach((oldScript) => {
                    const newScript = document.createElement("script");
                    if (oldScript.src) {
                        newScript.src = oldScript.src;
                        newScript.defer = true;
                    } else {
                        newScript.textContent = oldScript.textContent;
                    }
                    document.body.appendChild(newScript);
                });
            })
            .catch((error) =>
                console.error("Error loading sleep impact component:", error)
            );
    }
}

customElements.define("sleep-impact", SleepImpactComponent);

class BrainVisualization extends HTMLElement {
    connectedCallback() {
        fetch("brain.html")
            .then((response) => response.text())
            .then((html) => {
                this.innerHTML = html;
                this.querySelectorAll("script").forEach((oldScript) => {
                    const newScript = document.createElement("script");
                    if (oldScript.src) {
                        newScript.src = oldScript.src;
                        newScript.defer = true;
                    } else {
                        newScript.textContent = oldScript.textContent;
                    }
                    document.body.appendChild(newScript);
                });
            })
            .catch((error) =>
                console.error("Error loading brain visualization:", error)
            );
    }
}

customElements.define("brain-visualization", BrainVisualization);
