// The script ran when the extension popup's button is clicked.

showBar();

function showBar() {
    console.log(window.location.href)
    let url = window.location.href;
    let sideBar = document.getElementById("ReadingMapBar");
    if (sideBar === null){
        // Clear the entire page.
        document.body.innerHTML = "";
        
        // Make a new div to hold our things.
        let div = document.createElement("div");
        div.setAttribute("id", "readingMapBigBox");
        document.body.appendChild(div);
        // Create a new bar.
        sideBar = document.createElement("div");
        sideBar.setAttribute("id", "readingMapBar");   
        div.appendChild(sideBar);
        // Reopen the original window in an iframe.
        iframe = document.createElement("iframe");
        iframe.setAttribute("src", url);
        iframe.setAttribute("id", "readingMapIframe");
        iframe.setAttribute("title", "The original PDF reading page.")
        div.appendChild(iframe);
    }
    let data = loadData();
    buildContents(sideBar, data);
}


/** Draw the contents of the side bar. */
function buildContents(sidebar, data){
    // TODO
    console.log(data);
    sidebar.innerHTML = "Sidebar In Progress.";
}





