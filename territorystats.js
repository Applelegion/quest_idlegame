function getHostname(url) {
    //getHostname("https://en.wikipedia.org/wiki/Holy_Roman_Empire") => 
    //"en.wikipedia.org"
    const hostname = url.match(/:\/\/(?:www[1-9]?\.)?(.[^\/:]+)/);
    if (Array.isArray(hostname) === true && hostname.length === 2) {
        return hostname[1];
    }
    else {
        return null;
    }
}
function recalculateTPS() {
    //will recalculate the territories per second 
    //only time when upgrades/buildings are bought
}
const territories_count = document.getElementById("territory_counter")
chrome.storage.local.get("territories", function (result) {
    //displays the amount of territoriesx
    const territories = result.territories;
    chrome.storage.local.get("last_update", function (result) {
        //updates the amount of territories based on amount of time spent offline
        //technically you don't get cookies until you open up the popup
        if (Object.prototype.toString.call(result.last_update) === "[object Number]"){
            const time_passed = Date.now()-result.last_update;
            const cookies_earned = Math.round(time_passed/1000 * 0);
            const new_cookies = cookies_earned + territories;
            chrome.storage.local.set({last_update: Date.now(), territories: new_cookies});
            territories_count.textContent = "Territories: " + new_cookies;
        }
        else{
            territories_count.textContent = "Territories: " + territories;
        }
    });
});
chrome.storage.onChanged.addListener(function (changed, area) {
    if (changed.hasOwnProperty("territories")) {
        const changing_counter = document.getElementById("territory_counter");
        changing_counter.textContent = "Territories: " + changed.territories.newValue;
    }
});



