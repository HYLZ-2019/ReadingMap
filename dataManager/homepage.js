

window.addEventListener("load", homepageOnLoad);

function homepageOnLoad(){
    document.getElementById("showBrowserData").addEventListener("click", showBrowserData);
    document.getElementById("openLocalData").addEventListener("click", openLocalData);
    document.getElementById("mergeFiles").addEventListener("click", mergeFiles);
}