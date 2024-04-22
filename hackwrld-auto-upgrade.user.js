// ==UserScript==
// @name         Hack World Auto Upgrade
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Automatically upgrades miner when funds are sufficient
// @author       Strawwaffle
// @match        https://hackwrld.notacult.website/*
// @grant        none
// @updateURL   https://github.com/NickMarcha/DGG-IPA/blob/main/hackwrld-auto-upgrade.user.js
// @downloadURL https://github.com/NickMarcha/DGG-IPA/blob/main/hackwrld-auto-upgrade.user.js
// @supportURL  https://github.com/NickMarcha/DGG-IPA/issues
// ==/UserScript==


const UpgradesSettings = [
    {
        name:"Firewall",
        otherName:"firewall",
        upgradeEnabled:true,
        upgradeMultiplier:0.8,
        level:0
    }
    ,{
        name:"Scanner",
        otherName:"scanner",
        upgradeEnabled:false,
        upgradeMultiplier:0.5,
        level:0
    },{
        name:"Miner",
        otherName:"cryptoMiner",
        upgradeEnabled:true,
        upgradeMultiplier:1,
        level:0
    },{

        name:"Stealer",
        otherName:"stealer",
        upgradeEnabled:false,
        upgradeMultiplier:0.5,
        level:0
    }
];


(function() {
    'use strict';

    const URL = "https://hackwrld.notacult.website"

    // Function to handle the response
    function handleResponse(responseText,upgradesSettings){
        try {
            const response = JSON.parse(responseText);
            const state = response.state;
            const funds = state.funds.amount;

            for(let i = 0; i< upgradesSettings.length;i++){
                const current = upgradesSettings[i];
                upgradesSettings.level = state[current.otherName].level;

                if (current.upgradeEnabled && funds* current.upgradeMultiplier >= upgradesSettings.level / 10) {
                    fetch(URL + "/upgrade/" +current.name.toLowerCase(), {
                        method: 'POST',
                        credentials: 'include', // Send cookies
                    })
                        .then(response => {
                        console.log("Purchased a "+current.name+" upgrade");
                    })
                        .catch(error => console.error('Error upgrading '+current.name+':', error));
                }
            }



        } catch (error) {
            console.log("responseText", responseText)
            console.error('Error handling response:', error);
            // Stop script execution on error
            stopScript();
        }
    }

    function handleScanResponse(responseText) {
        try {
            const response = JSON.parse(responseText);
            const scans = response.scans;

            function getStealerLevel() {
                for (let i = 0; i < UpgradesSettings.length; i++) {
                    if (UpgradesSettings[i].name === "Stealer") {
                        return UpgradesSettings[i].level;
                    }
                }
                return null; // Return null if "Stealer" upgrade is not found
            }

            const bestTargets = scans.filter(s => s.firewall < getStealerLevel() && s.cooldown.time <1 && s.funds.amount > 1);

            if(bestTargets.length <1) {
                console.log("No good targets found");
            }else {
                console.log("Good Targets",bestTargets);
            }

        } catch (error) {
            console.log("responseText", responseText)
            console.error('Error handling scan response:', error);
            // Stop script execution on error

        }

    }

    // Function to stop script execution
    function stopScript() {
        XMLHttpRequest.prototype.open = null; // Remove the XHR event listener
        console.log("Script stopped due to error.");
    }

    // Intercept XHR requests
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener('readystatechange', function() {
            if (this.readyState === 4 && this.status === 200 && this.responseURL === 'https://hackwrld.notacult.website/state') {
                handleResponse(this.responseText,UpgradesSettings);
            }

            if (this.readyState === 4 && this.status === 200 && this.responseURL === 'https://hackwrld.notacult.website/scan/out') {
                handleScanResponse(this.responseText);
            }
        });
        originalOpen.apply(this, arguments);
    };
    const jumboTronDiv = document.getElementsByClassName("jumbotron")[0];
    const interfaceDiv = document.createElement("div");
    interfaceDiv.style.marginTop = "20px";



    for(let i = 0; i< UpgradesSettings.length;i++){
        const current = UpgradesSettings[i];
        // Checkbox for scanner
        const upgradeCheckbox = document.createElement("input");
        upgradeCheckbox.type = "checkbox";
        upgradeCheckbox.checked = current.upgradeEnabled;
        upgradeCheckbox.addEventListener("change", function() {
            current.upgradeEnabled = this.checked;
        });
        const upgradelLabel = document.createElement("label");
        upgradelLabel.textContent = "Upgrade " + current.name;
        interfaceDiv.appendChild(upgradeCheckbox);
        interfaceDiv.appendChild(upgradelLabel);

        // Slider for scanner
        const upgradeSlider = document.createElement("input");
        upgradeSlider.type = "range";
        upgradeSlider.min = "0.1";
        upgradeSlider.max = "1";
        upgradeSlider.step = "0.1";
        upgradeSlider.value = current.upgradeMultiplier;
        upgradeSlider.addEventListener("input", function() {
            current.upgradeMultiplier = parseFloat(this.value);
            // Update the value label when the slider changes
            upgradeValue.textContent = this.value;
        });
        const upgradeMulLabel = document.createElement("label");
        upgradeMulLabel.textContent = current.name + " Upgrade Multiplier";
        // Create a <span> to hold the slider value
        const upgradeValue = document.createElement("span");
        upgradeValue.textContent = upgradeSlider.value;
        // Append slider, value label, and line break
        interfaceDiv.appendChild(upgradeSlider);
        interfaceDiv.appendChild(upgradeMulLabel);
        interfaceDiv.appendChild(upgradeValue);
        interfaceDiv.appendChild(document.createElement("br"));
        interfaceDiv.appendChild(document.createElement("br"));
    }


    // Append interface to jumbotron div
    jumboTronDiv.appendChild(interfaceDiv);
})();
