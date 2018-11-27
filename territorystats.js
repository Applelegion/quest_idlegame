class Item {
    constructor(name, basecost, tps, id = false) {
        this.quantity;
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
        document.getElementById("item_div").appendChild(this.child);
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
        let tps = 0;
        for (var key of Object.keys(result.buildings)) {
            tps += (result.buildings[key] * item[key].tps);
        }
        let tpsCounter = document.getElementById("tpsCounter");
        tpsCounter.textContent = "TPS: " + tps;
        callback(tps);
    });
}
function updateButtons(){
    chrome.storage.local.get("buildings", function (result) {
        for (var key of Object.keys(result.buildings)){
            let currentItem = item[key];
            let cost = currentItem.basecost * (result.buildings[key] + 1);
            item[key].child.textContent = currentItem.name + ":" + result.buildings[key] + ":" + currentItem.tps + ":" + cost;
        }
    })
}
function init() {

    const PRICE_GROWTH = 1.1;
    item.scout = new Item("scout", 50, 1);
    item.settler = new Item("settler", 400, 10);
    item.manAtArms = new Item("man at arms", 2500, 50, "manAtArms");
    //plural of "man at arms" is "men at arms"
    item.soldier = new Item("soldier", 10000, 240);
    item.overlord = new Item("overlord", 30000, 1000);
    item.merchant = new Item("merchant", 100000, 5000);
    item.galleon = new Item("galleon", 450000, 20000);
    item.flagMaker = new Item("flag maker", 9999999, 1234567, "flagMaker");

    document.getElementById("reset").onclick = function (){
        //reset function
        chrome.storage.local.set({
            territories: 25000, 
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
    var tps;
    chrome.storage.local.get("buildings", function (result) {
        tps = 0;
        for (var buildings of Object.keys(result.buildings)) {
            let key = buildings;
            let amount = result.buildings[key];
            let currentItem = item[key]
            tps += (amount * currentItem.tps);
            let cost = Math.round(currentItem.basecost * (PRICE_GROWTH ** (amount)));
            currentItem.child.textContent = currentItem.name + ":" + amount + ":" + currentItem.tps + ":" + cost;
            function buy () {
                // Button Listener function
                chrome.storage.local.get(["territories", "buildings"], function (result) {
                    let cost = currentItem.basecost * (result.buildings[key] + 1);
                    if (result.territories >= cost) {
                        result.buildings[key] = (result.buildings[key] + 1);
                        chrome.storage.local.set({ "buildings": result.buildings });
                        item[key].child.textContent = currentItem.name + ":" + result.buildings[key] + ":" + currentItem.tps + ":" + Math.round(currentItem.basecost * (PRICE_GROWTH ** (result.buildings[key])));
                        setTerritories(result.territories - cost);
                        recalculateTPS();
                        document.getElementById(currentItem.id).addEventListener("click", buy);
                    }
                });
            }
            document.getElementById(currentItem.id).addEventListener("click", buy);
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
var item = {}; 
init();


