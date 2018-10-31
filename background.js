function getHostname(url) {
    //gets the domain name of a website
    //getHostname("https://en.wikipedia.org/wiki/Holy_Roman_Empire") => 
    //"en.wikipedia.org"
    const hostname = url.match(/:\/\/(?:www[1-9]?\.)?(.[^\/:]+)/)
    if (Array.isArray(hostname) === true && hostname.length === 2) {
        return hostname[1];
    } else {
        return null;
    }
}

function setTerritories(amount, callback = () => { }) {
    if (!isNaN(amount)) {
        chrome.storage.local.set({ territories: amount })
        callback();
    }
    else {
        return NaN
    }
}
function addTerritories(amount, callback = () => { }) {
    if (!isNaN(amount)) {
        chrome.storage.local.get('territories', function (result) {
            new_amount = result.territories + amount
            chrome.storage.local.set({ territories: new_amount })
            callback(new_amount);
            return new_amount;
        });
    }
    else {
        return NaN
    }
}
function subtractTerritoriess(amount, callback = () => { }) {

}
function getTabUrls() {
    chrome.tabs.query({}, function (tabs) {
        const taburls = tabs.map(tab => tab.url);
        chrome.storage.local.set({ urls: taburls });
        chrome.storage.local.set({ visited_hostnames: taburls.map(url => getHostname(url)) });
    });
}
function getWindows() {
    chrome.windows.getAll({ populate: true }, function (all_windows) {
        const windowids = {}
        for (windows of all_windows) {
            windowids[windows.id] = windows;
        }
        chrome.storage.local.set({ windowids: windowids })
    })
}
function getTerritories(callback = () => { }) {
    chrome.storage.local.get('territories', function (result) {
        console.log(result.territories);
        callback(result.territories)
        //return result.tabcoins;
    });
}
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    //when a new tab is opened, checks to see if hostname is found in a list of hostnames
    if (tab.status === "complete") {
        addTerritories(1);
        // chrome.storage.local.get('visited_hostnames', function (result) {
        //     //console.log(result)
        //     let visited_hostnames = result.visited_hostnames
        //     var current_hostname = getHostname(tab.url)
        //     //console.log(visited_hostnames)
        //     //console.log(current_hostname)
        //     if (!visited_hostnames.includes(current_hostname)) {
        //         //console.log("url match not found");
        //         visited_hostnames.push(current_hostname);
        //         chrome.storage.local.set({ visited_hostnames: visited_hostnames })
        //     } else {
        //         //console.log("url match found")
        //     }
        // });
    }


});
chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.get(["territories"], function (result) {
        if (typeof (result.territories) !== "number") {
            chrome.storage.local.set({ territories: 0 })
        }
    });
    chrome.storage.local.get(["last_update"], function (result) {
        if(Object.prototype.toString.call(result.last_update) !== "[object Date]"){
            console.log("NEW")
            chrome.storage.local.set({last_update: new Date()})
        }
        else{
            console.log("not new")
        }
    });
});
// chrome.runtime.onInstalled.addListener(function () {
//     console.log("alarm test")
//     const next_minute = new Date();
//     next_minute.setMinutes(next_minute.getMinutes());
//     next_minute.setSeconds(0);
//     next_minute.setMilliseconds(0);
//     chrome.alarms.create("waitforminute", { when: Date.parse(next_minute), periodInMinutes: 1 })
//     chrome.alarms.onAlarm.addListener(function (alarm) {
//         console.log(new Date())
//         chrome.windows.getAll({ populate: true }, function (all_windows) {
//             const windowids = {}
//             for (windows of all_windows) {
//                 windowids[windows.id] = windows;
//             }
//             console.log(windowids)
//             chrome.storage.local.set({ windowids: windowids })
//         })
//     })
// })