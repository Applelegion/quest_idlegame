function getHostname(url){
    //gets the domain name of a website
    //getHostname("https://en.wikipedia.org/wiki/Holy_Roman_Empire") => 
    //"en.wikipedia.org"
    const hostname = url.match(/:\/\/(?:www[1-9]?\.)?(.[^\/:]+)/)
    if (Array.isArray(hostname) === true && hostname.length === 2){
        return hostname[1];
    }
    else {
        return null;
    }
}
const territories_count = document.getElementById("territory_counter")
chrome.storage.local.get("territories", function(result){
    console.log(result)
    territories_count.textContent = "Territories: " + result.territories;
})
chrome.storage.onChanged.addListener(function (changed, area){
    if (changed.hasOwnProperty("territories")){
        const changing_counter = document.getElementById("territory_counter");
        changing_counter.textContent = "Territories: " + changed.territories.newValue;
    }
})
setInterval(function (){
    
}, 1000);
function make_coinmaker(name){

}


