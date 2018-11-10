class Building {
    constructor(name, basecost, tps, id = false) {
        //move basecost and amount out of Building 
        this.quantity;
        this.cost;
        this.basecost = basecost;
        this.tps = tps;
        this.name = name;
        var child = document.createElement("button");
        if (id === false) {
            this.id = name;
            child.id = name;
        }
        else {
            this.id = id;
            child.id = id
        }
        child.textContent = name;
        child.className = "buyButton";
        this.child = child;
        document.body.appendChild(child);
    }
    getCost(callback = () => { }) {
        chrome.storage.local.get('buildings', function (result) {
            const cost = this.basecost * (result.buildings[this.id] + 1);
            callback(cost);
        })
    }
}
function setTerritories(amount, callback = () => { }) {
    if (!isNaN(amount)) {
        chrome.storage.local.set({ territories: amount })
        callback();
    }
    else {
        //placeholder
    }
}
function addTerritories(amount, callback = () => { }) {
    if (!isNaN(amount)) {
        chrome.storage.local.get('territories', function (result) {
            let newAmount = Math.round(result.territories + amount);
            chrome.storage.local.set({ territories: newAmount })
            callback(newAmount);
        });
    }
    else {
        //placeholder
    }
}
function subtractTerritories(amount, callback1 = () => { }, callback2 = () => { }) {
    if (!isNaN(amount)) {
        chrome.storage.local.get('territories', function (result) {
            if (amount > result.territories){
                callback2(amount);
            }
            else{
                let newAmount = result.territories + amount
                chrome.storage.local.set({ territories: newAmount })
                callback1(newAmount);
            }
        });
    }
    else {
        //placeholder
    }
}
function init() {
    building.scout = new Building("scout", 50, 1);
    building.settler = new Building("settler", 400, 10);
    building.manAtArms = new Building("man at arms", 25000, 50, "manAtArms");
    //plural of "man at arms" is "men at arms"
    building.soldier = new Building("soldier", 10000, 240);
    building.overlord = new Building("overlord", 30000, 1000);
    building.merchant = new Building("merchant", 100000, 5000);
    building.galleon = new Building("galleon", 450000, 20000);
    building.flagMaker = new Building("flag maker", 9999999, 1234567, "flagMaker");
    chrome.storage.local.get("buildings", function (result) {
        tps = 0;
        for (buildings of Object.keys(result.buildings)) {
            let key = buildings;
            let amount = result.buildings[key];
            let currentBuilding = building[key]
            tps += (amount * currentBuilding.tps);
            currentBuilding.quantity = amount;
            currentBuilding.cost = currentBuilding.basecost * (amount + 1);
            document.getElementById(currentBuilding.id).addEventListener("click", function () {
                chrome.storage.local.get("territories", function (result) {
                    if (result.territories >= currentBuilding.cost) {
                        chrome.storage.local.get("buildings", function (result) {
                            let newBuildings = result.buildings;
                            newBuildings[key] = newBuildings[key] + 1;
                            chrome.storage.local.set({ "buildings": newBuildings })
                            setTerritories(result.territories -= currentBuilding.cost);
                            recalculateTPS();
                        });
                    }
                });
            });
        }
        let tpsCounter = document.getElementById("tpsCounter");
        tpsCounter.textContent = "TPS: " + tps;
        interval = setInterval(function(){
            addTerritories(tps);
        }, 1000);
    });
}
function recalculateTPS(callback = () => { }) {
    chrome.storage.local.get("buildings", function (result) {
        tps = 0;
        for (key of Object.keys(result.buildings)) {
            tps += (result.buildings[key] * building[key].tps);
        }
        console.log(tps);
        let tpsCounter = document.getElementById("tpsCounter");
        tpsCounter.textContent = "TPS: " + tps;
        clearInterval(interval);
        interval = setInterval(function(){
            addTerritories(tps);
        }, 1000);
        callback(tps);
    });
}

var building = {};
var tps;
var interval; 
init();
chrome.storage.local.get("territories", function (result) {
    const territories = result.territories;
    const territoriesCount = document.getElementById("territoryCounter")
    chrome.storage.local.get("lastUpdate", function (result) {
        //updates the amount of territories based on amount of time spent offline
        //technically you don't get cookies until you open up the popup
        if (Object.prototype.toString.call(result.lastUpdate) === "[object Number]") {
            const timePassed = Date.now() - result.lastUpdate;
            const cookiesEarned = Math.round(timePassed / 1000 * tps);
            const newCookies = cookiesEarned + territories;
            chrome.storage.local.set({ lastUpdate: Date.now(), territories: newCookies });
            territoriesCount.textContent = "Territories: " + newCookies;
        }
        else {
            territoriesCount.textContent = "Territories: " + territories;
        }
    });
});
chrome.storage.onChanged.addListener(function (changed, area) {
    if (changed.hasOwnProperty("territories")) {
        const changingCounter = document.getElementById("territoryCounter");
        changingCounter.textContent = "Territories: " + changed.territories.newValue;
    }
    if (changed.hasOwnProperty("buildings")) {

    }
});
// function getHostname(url) {
//     //getHostname("https://en.wikipedia.org/wiki/Holy_Roman_Empire") => 
//     //"en.wikipedia.org"
//     const hostname = url.match(/:\/\/(?:www[1-9]?\.)?(.[^\/:]+)/);
//     if (Array.isArray(hostname) === true && hostname.length === 2) {
//         return hostname[1];
//     }
//     else {
//         return null;
//     }
// }


