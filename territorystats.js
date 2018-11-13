class Building {
    constructor(name, basecost, tps, id = false) {
        //move basecost and amount out of Building 
        this.quantity;
        this.cost;
        this.basecost = basecost;
        this.tps = tps;
        this.name = name;
        this.child = document.createElement("button");
        if (id === false) {
            this.id = name;
            this.child.id = name;
        }
        else {
            this.id = id;
            this.child.id = id
        }
        this.child.textContent = name;
        this.child.className = "buyButton";
        document.body.appendChild(this.child);
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
function recalculateTPS(callback = () => { }) {
    chrome.storage.local.get("buildings", function (result) {
        console.log("recalculating")
        let tps = 0;
        for (var key of Object.keys(result.buildings)) {
            tps += (result.buildings[key] * building[key].tps);
        }
        let tpsCounter = document.getElementById("tpsCounter");
        tpsCounter.textContent = "TPS: " + tps;
        callback(tps);
    });
}
function updateButtons(){
    chrome.storage.local.get("buildings", function (result) {
        for (var key of Object.keys(result.buildings)){
            currentBuilding = building[key];
            currentBuilding.cost = currentBuilding.basecost * (result.buildings[key] + 1);
            building[key].child.textContent = currentBuilding.name + ":" + result.buildings[key] + ":" + currentBuilding.tps + ":" + currentBuilding.cost;
        }
    })
}
function init() {
    document.getElementById("reset").onclick = function (){
        console.log("resetting")
        chrome.storage.local.set({
            territories: 10000, 
            lastUpdate: Date.now(), 
            "buildings": {
                "scout": 0, "settler": 0, "manAtArms": 0, "soldier": 0, 
                "overlord": 0,"merchant": 0, "galleon": 0, "flagMaker": 0,
            },
        }, function (result){
            recalculateTPS();
            updateButtons();
        });
    }
    building.scout = new Building("scout", 50, 1);
    building.settler = new Building("settler", 400, 10);
    building.manAtArms = new Building("man at arms", 25000, 50, "manAtArms");
    //plural of "man at arms" is "men at arms"
    building.soldier = new Building("soldier", 10000, 240);
    building.overlord = new Building("overlord", 30000, 1000);
    building.merchant = new Building("merchant", 100000, 5000);
    building.galleon = new Building("galleon", 450000, 20000);
    building.flagMaker = new Building("flag maker", 9999999, 1234567, "flagMaker");
    var tps;
    chrome.storage.local.get("buildings", function (result) {
        tps = 0;
        for (var buildings of Object.keys(result.buildings)) {
            let key = buildings;
            let amount = result.buildings[key];
            let currentBuilding = building[key]
            tps += (amount * currentBuilding.tps);
            currentBuilding.cost = currentBuilding.basecost * (amount + 1);
            currentBuilding.child.textContent = currentBuilding.name + ":" + amount + ":" + currentBuilding.tps + ":" + currentBuilding.cost;
            function buy () {
                chrome.storage.local.get(["territories", "buildings"], function (result) {
                    currentBuilding.cost = currentBuilding.basecost * (result.buildings[key] + 1);
                    if (result.territories >= currentBuilding.cost) {
                        let newBuildings = result.buildings;
                        newBuildings[key] = newBuildings[key] + 1;
                        chrome.storage.local.set({ "buildings": newBuildings });
                        building[key].child.textContent = currentBuilding.name + ":" + newBuildings[key] + ":" + currentBuilding.tps + ":" + currentBuilding.cost;
                        setTerritories(result.territories - currentBuilding.cost);
                        recalculateTPS();
                        document.getElementById(currentBuilding.id).addEventListener("click", buy);
                    }
                });
            }
            document.getElementById(currentBuilding.id).addEventListener("click", buy);
        }
        let tpsCounter = document.getElementById("tpsCounter");
        tpsCounter.textContent = "TPS: " + tps;
        let interval = setInterval(function(){
            recalculateTPS(function(result){
                chrome.storage.local.set({lastUpdate: Date.now()})
                addTerritories(result);
            });
        }, 1000);
    });
    chrome.storage.local.get(["territories", "lastUpdate"], function (result) {
        //updates the amount of territories based on amount of time spent offline
        //technically you don't get cookies until you open up the popup
        const territories = result.territories;
        const territoriesCount = document.getElementById("territoryCounter")
        //makes sure the lastUpdate variable is a number, probably useless
        if (Object.prototype.toString.call(result.lastUpdate) === "[object Number]") {
            const timePassed = Date.now() - result.lastUpdate;
            const cookiesEarned = Math.round(timePassed / 1000) * tps;
            const newCookies = cookiesEarned + territories;
            chrome.storage.local.set({ lastUpdate: Date.now(), territories: newCookies });
            territoriesCount.textContent = "Territories: " + newCookies;
        }
        else {
            territoriesCount.textContent = "Territories: " + territories;
        }
    });
    chrome.storage.onChanged.addListener(function (changed, area) {
        if (changed.hasOwnProperty("territories")) {
            const changingCounter = document.getElementById("territoryCounter");
            changingCounter.textContent = "Territories: " + changed.territories.newValue;
        }
    });
}
var building = {}; 
init();
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


