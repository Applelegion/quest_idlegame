function getHostname(url) {
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
        //placeholder
    }
}
function addTerritories(amount, callback = () => { }) {
    if (!isNaN(amount)) {
        chrome.storage.local.get('territories', function (result) {
            new_amount = result.territories + amount
            chrome.storage.local.set({ territories: new_amount })
            callback(new_amount);
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
                new_amount = result.territories + amount
                chrome.storage.local.set({ territories: new_amount })
                callback1(new_amount);
            }
        });
    }
    else {
        //placeholder
    }
}
function getTerritories(callback = () => { }) {
    chrome.storage.local.get('territories', function (result) {
        console.log(result.territories);
        callback(result.territories)
        //return result.tabcoins;
    });
}
function checkStorage(items, new_value = 0) {
    //checkStorage can accept strings and array of strings
    //makes sure values exist in chrome storage and creates them if they do not exist
    //eventually will be changed to object instead of array
    if (Object.prototype.toString.call(items) === "[object String]") {
        chrome.storage.local.get(items, function (result) {
            if (Object.keys(result).length === 0 && result.constructor === Object) {
                chrome.storage.local.set({ [items]: new_value });
            }
        });
    }
    else {
        chrome.storage.local.get(items, function (result) {
            var create_obj = {}
            for (item of items) {
                if (result.hasOwnProperty(item) === false) {
                    create_obj[item] = new_value;
                }
            }
            chrome.storage.local.set(create_obj);
        });
    }
}
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    //TBD later
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
    checkStorage("territories", 0);
    checkStorage("last_update", Date.now());
    checkStorage("buildings", {
        "scout": 0, "settler": 0, "man-at-arms": 0, "soldier": 0, "overlord": 0,
        "merchant": 0, "galleon": 0, "flag-maker": 0, "colonial_offices": 0, "plane": 0, "diplomat": 0,
        "administrative_offices": 0, "spaceship": 0, "warp_field": 0, "portal": 0, "the_machine": 0
    })
});
// function getTabUrls() {
//     chrome.tabs.query({}, function (tabs) {
//         const taburls = tabs.map(tab => tab.url);
//         chrome.storage.local.set({ urls: taburls });
//         chrome.storage.local.set({ visited_hostnames: taburls.map(url => getHostname(url)) });
//     });
// }
// function getWindows() {
//     chrome.windows.getAll({ populate: true }, function (all_windows) {
//         const windowids = {}
//         for (windows of all_windows) {
//             windowids[windows.id] = windows;
//         }
//         chrome.storage.local.set({ windowids: windowids })
//     })
// }