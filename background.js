function addTerritories(amount, callback = () => { }) {
    if (!isNaN(amount)) {
        chrome.storage.local.get('territories', function (result) {
            let newAmount = result.territories + amount
            console.log(newAmount)
            chrome.storage.local.set({ territories: newAmount })
            callback(newAmount);
        });
    }
}
function checkStorage(items) {
    //makes sure keys exist in chrome storage and creates them if they do not exist
    //takes an obj with the keys to be checked, 
    //and the value to set if the keys do not exist
    chrome.storage.local.get(Object.keys(items), function (result) {
        let setObj = {}
        for (key of Object.keys(items)) {
            if (result.hasOwnProperty(key) === false) {
                setObj[key] = items[key]
            }
        }
        chrome.storage.local.set(setObj)
    });
}
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    //TBD later
    if (tab.status === "complete") {
        addTerritories(1);
        // chrome.storage.local.get('visitedHostnames', function (result) {
        //     //console.log(result)
        //     let visitedHostnames = result.visitedHostnames
        //     var currentHostname = getHostname(tab.url)
        //     //console.log(visitedHostnames)
        //     //console.log(currentHostname)
        //     if (!visitedHostnames.includes(currentHostname)) {
        //         //console.log("url match not found");
        //         visitedHostnames.push(currentHostname);
        //         chrome.storage.local.set({ visitedHostnames: visitedHostnames })
        //     } else {
        //         //console.log("url match found")
        //     }
        // });
    }
});
function beginApocalypse(changed, area) {
    if (changed.hasOwnProperty("buildings")) {
        if (changed.buildings.newValue.manAtArms > 0) {
            console.log("the invasion begins");
            chrome.storage.local.set({ "invasion_counter": 0 });
            chrome.alarms.create("invasion", { periodInMinutes: 10 });
            chrome.alarms.onAlarm.addListener(function (alarm) {
                if (alarm.name === "invasion") {
                    console.log("you are being invaded!!!");
                    chrome.storage.local.get("invasion_counter", function (result){
                        chrome.storage.local.set({"invasion_counter": result.invasion + 1})
                    })
                }
            });
            chrome.storage.onChanged.removeListener(beginApocalypse);
        }
    }
}

chrome.runtime.onInstalled.addListener(function () {
    checkStorage({ "territories": 50 });
    checkStorage({ "lastUpdate": Date.now() });
    checkStorage({
        "buildings": {
            "scout": 0, "settler": 0, "manAtArms": 0, "soldier": 0, "overlord": 0,
            "merchant": 0, "galleon": 0, "flagMaker": 0,
            // "colonialOffice": 0, "diplomat": 0, "plane": 0, "administrativeOffice": 0 
            //"spaceship": 0, "warpField": 0, "portal": 0, "theMachine": 0
        }
    })
    chrome.storage.onChanged.addListener(beginApocalypse);
});
// function getTabUrls() {
//     chrome.tabs.query({}, function (tabs) {
//         const taburls = tabs.map(tab => tab.url);
//         chrome.storage.local.set({ urls: taburls });
//         chrome.storage.local.set({ visitedHostnames: taburls.map(url => getHostname(url)) });
//     });
// }
// function getWindows() {
//     chrome.windows.getAll({ populate: true }, function (allWindows) {
//         const windowids = {}
//         for (windows of allWindows) {
//             windowids[windows.id] = windows;
//         }
//         chrome.storage.local.set({ windowids: windowids })
//     })
// }
// function getHostname(url) {
//     //getHostname("https://en.wikipedia.org/wiki/Holy_Roman_Empire") => 
//     //"en.wikipedia.org"
//     const hostname = url.match(/:\/\/(?:www[1-9]?\.)?(.[^\/:]+)/)
//     if (Array.isArray(hostname) === true && hostname.length === 2) {
//         return hostname[1];
//     } else {
//         return null;
//     }
// }