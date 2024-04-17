// ==UserScript==
// @name         Hack World Auto Upgrade
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Automatically upgrades miner when funds are sufficient
// @author       Strawwaffle
// @match        https://hackwrld.notacult.website/*
// @grant        none
// @updateURL   https://github.com/NickMarcha/DGG-IPA/blob/main/hackwrld-auto-upgrade.user.js
// @downloadURL https://github.com/NickMarcha/DGG-IPA/blob/main/hackwrld-auto-upgrade.user.js
// @supportURL  https://github.com/NickMarcha/DGG-IPA/issues
// ==/UserScript==

(function() {
    'use strict';
    const URL = "https://hackwrld.notacult.website"

    // Function to handle the response
    function handleResponse(responseText) {
        try {
            const response = JSON.parse(responseText);
            const state = response.state;
            const funds = state.funds.amount;
            const minerLevel = state.cryptoMiner.level;
            const firewallLevel = state.firewall.level
            console.log(`Coins: ${funds} Miner level: ${minerLevel}`);

            // Check if funds are greater than or equal to 10 times the miner level
            if (funds >= minerLevel / 10) {
                // Upgrade miner
                fetch(URL + "/upgrade/miner", {
                    method: 'POST',
                    credentials: 'include', // Send cookies
                })
                    .then(response => {
                    console.log("Purchased a miner upgrade");
                })
                    .catch(error => console.error('Error upgrading miner:', error));
            }

             // Check if funds are greater than or equal to 10 times the miner level
            if (funds * 0.8 >= firewallLevel / 10) {
                // Upgrade miner
                fetch(URL + "/upgrade/firewall", {
                    method: 'POST',
                    credentials: 'include', // Send cookies
                })
                    .then(response => {
                    console.log("Purchased a firewall upgrade");
                })
                    .catch(error => console.error('Error upgrading firewall:', error));
            }
        } catch (error) {
            console.error('Error handling response:', error);
            // Stop script execution on error
            stopScript();
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
                handleResponse(this.responseText);
            }
        });
        originalOpen.apply(this, arguments);
    };
/*
    const jumboTronDiv = document.getElementsByClassName("jumbotron");
     const textnode = document.createTextNode("Water");

    jumboTronDiv.appendChild(textnode);*/
})();
