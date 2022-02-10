console.log("Hello Map!");
var SVG_NS = 'http://www.w3.org/2000/svg';



// The class storing user preferences. Preferences can be modified in options.html.
class ReadingMapPreferences {
    constructor(){
        // The default settings.

        // The user can "read" the page by staying on it for minReadMilliseconds.
        this.minReadMilliseconds = 2 * 1000;

        // Pages read for >= maxReadTimes times are all the same color.
        this.maxReadTimes = 5;

        // Colors to represent different reading times.
        this.barColors = [];
        for (let i=0; i<=this.maxReadTimes; i++){
            let opacity =  i/this.maxReadTimes;
            let color = "rgba(0, 255, 0, " + opacity + ")";
            this.barColors.push(color);
        }

    }
}

class ReadingMapMetadata {
    constructor(pages){
        // TODO: add other metadata.

        // How many pages are in this pdf.
        this.pages = pages;
    }
}

// The class for [ All recorded data for a single PDF ].
class ReadingMapRecord {
    constructor(metadata) {
        // Metadata about "which pdf this is for".
        this.metadata = metadata;

        let pages = metadata.pages;

        // An array in which readTimes[i-1] is how many times the ith page has been read. 
        this.readTimes = [];
        for (let i=0; i<pages; i++){
            this.readTimes.push(0);
        }
    }
}

// The ReadingMapPreferences object storing the user's preferences.
var rmUserPrefs;

// The ReadingMapMetadata object for this tab.
var pdfMetadata;

// The ReadingMapRecord object for this tab. 
var pdfRecord;

// The previous page number.
var rmPreviousPage = 1;

// The time we first arrived at rmPreviousPage.
var rmStartTime = new Date();

window.addEventListener("load", viewerOnLoad);


function viewerOnLoad(){
    // Wait for pdfViewer to load.
    let before = new Date();
    //while (!window.PDFViewerApplication.pdfViewer){}
    let checkExist = setInterval(function() {
        if (window.PDFViewerApplication.pdfViewer !== null) {
           clearInterval(checkExist);
           completeLoad(before);
        }
     }, 10); // check every 100ms
}

function completeLoad(before){
    let after = new Date();
    console.log("It took " + (after.getTime()-before.getTime()) + "ms for pdfViewer to load.");
    
    rmPreviousPage = rmGetCurrentPage();
    rmStartTime = new Date();

    rmUserPrefs = localStorage.getItem("rmUserPrefs");
    if (!rmUserPrefs){
        rmUserPrefs = new ReadingMapPreferences();
    }
    
    // TODO: Initialize pdfMetadata with real data acquired from the viewer.
    pdfMetadata = new ReadingMapMetadata(510);
    // TODO: Check if we have records for this pdf and read it from the disc.
    pdfRecord = new ReadingMapRecord(pdfMetadata);
    
    rmInitializeBar();
    rmRenderBar();
    
    window.addEventListener("wheel", rmUpdate);
    window.addEventListener("click", rmUpdate);
    window.addEventListener("keydown", rmUpdate);
}

function rmGetCurrentPage(){
    return window.PDFViewerApplication.pdfViewer._currentPageNumber;
}

/** Function rmUpdate is called whenever the user may switch to another page. "Switching" may be caused by mouse wheel, click, or keyboard movement, so this callback should listen to any of these events. */
function rmUpdate(e){
    let currentpage = rmGetCurrentPage();
    if (currentpage == rmPreviousPage){
        // The page number is not changed.
        return;
    }
    
    // The page number has changed.
    let timenow = new Date();
    if (timenow.getTime() - rmStartTime.getTime() > rmUserPrefs.minReadMilliseconds) {
        pdfRecord.readTimes[rmPreviousPage-1] += 1;
    }
    rmSetPageColor(rmPreviousPage-1, pdfRecord.readTimes[rmPreviousPage-1]);
    
    rmPreviousPage = currentpage;
    rmStartTime = timenow;
}

function rmInitializeBar(){
    let svg = document.getElementById("readingMapBarSVG");
    // Draw a rectangle for each page.
    for (let i=0; i<pdfMetadata.pages; i++){
        let rect = document.createElementNS(SVG_NS, "rect");
        rect.setAttribute("class", "readingMapBarBlock");
        rect.setAttribute("x", 0);
        rect.setAttribute("y", 100*i);
        rect.setAttribute("width", 100);
        rect.setAttribute("height", 100);
        svg.appendChild(rect);
    }
    svg.setAttribute("viewBox", "0 0 100 " + pdfMetadata.pages*100);
    svg.setAttribute("preserveAspectRatio", "none");
}

// Set the color of the rectangle for page pagenum according to the times it has been read.
function rmSetPageColor(pagenum, times){
    let rect = document.getElementById("readingMapBarSVG").childNodes[pagenum];
    let color = rmUserPrefs.barColors[times];
    rect.setAttribute("fill", color);
}


function rmRenderBar(){
    for (let i=0; i<pdfMetadata.pages; i++){
        rmSetPageColor(i, pdfRecord.readTimes[i]);
    }
}