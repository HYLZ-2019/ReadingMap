// The script ran when the extension popup's button is clicked.

showBar();

function showBar() {
    let sideBar = document.getElementById("ReadingMapBar");
    if (sideBar === null){
        // Create a new bar.
        sideBar = document.createElement("div");
        sideBar.setAttribute("id", "ReadingMapBar");
        sideBar.setAttribute("class", "readingMapBar");        
        document.body.appendChild(sideBar);
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





