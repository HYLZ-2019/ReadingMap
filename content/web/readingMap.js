console.log("Hello Map!");
var SVG_NS = 'http://www.w3.org/2000/svg';



// The class storing user preferences. Preferences can be modified in options.html.
class ReadingMapPreferences {
    constructor(initstring){
        if (initstring == undefined) {
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
        else {
            let obj = JSON.parse(initstring);
            this.minReadMilliseconds = obj.minReadMilliseconds;
            this.maxReadTimes = obj.maxReadTimes;
            this.barColors = obj.barColors;
        }

    }
    getBarColor(times){
        times = times > this.maxReadTimes? this.maxReadTimes : times;
        return this.barColors[times];
    }
}

class ReadingMapMetadata {
    constructor(){
        // The pdf's title.
        this.title = document.getElementsByTagName("title")[0].innerText;

        // The file path.
        this.path = window.location.pathname;

        // How many pages are in this pdf.
        this.pages = window.PDFViewerApplication.pdfViewer.pdfDocument._pdfInfo.numPages;

        // The fingerprint identifier provided by pdf.js.
        this.fingerprint = window.PDFViewerApplication.pdfViewer.pdfDocument._pdfInfo.fingerprint;
    }

    toString(){
        // TODO: Use a unique & more compact representation!
        return JSON.stringify(this);
    }
}

// The class for [ All recorded data for a single PDF ].
class ReadingMapRecord {
    constructor(initstring) {
        if (initstring == undefined) {
            // Grab information from the current page.
            // Metadata about "which pdf this is for".
            this.metadata = pdfMetadata;

            let pages = this.metadata.pages;

            // An array in which readTimes[i-1] is how many times the ith page has been read. 
            this.readTimes = [];
            for (let i=0; i<pages; i++){
                this.readTimes.push(0);
            }
        }
        else {
            console.log(initstring);
            // TODO: make this more elegant.
            let obj = JSON.parse(initstring);
            this.metadata = obj.metadata;
            this.pages = obj.pages;
            this.readTimes = obj.readTimes;
        }
    }
    toString(){
        // TODO: Use a more compact representation.
        return JSON.stringify(this);
    }
}

// The ReadingMapPreferences object storing the user's preferences.
var rmUserPrefs;

// The Set of metadatas for pdfs that we keep track of. Currently it is stored as JSON.stringify(Array).
var rmMetadataSet;

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
    // Load rmMetadataSet. (It doesn't need to wait for pdfViewer.)
    rmMetadataSetString = localStorage.getItem("rmMetadataSet");
    console.log(rmMetadataSetString);
    if (rmMetadataSetString == null){
        rmMetadataSet = new Set();
        localStorage.setItem("rmMetadataSet", JSON.stringify(Array.from(rmMetadataSet)));
    }
    else{
        rmMetadataSet = new Set(JSON.parse(rmMetadataSetString));
    }

    // Wait for pdfViewer to load.
    let before = new Date();
    let checkExist = setInterval(function() {
        // Wait until the whole family is neither null nor undefined.
        if (window.PDFViewerApplication.pdfViewer && window.PDFViewerApplication.pdfViewer.pdfDocument && window.PDFViewerApplication.pdfViewer.pdfDocument._pdfInfo && window.PDFViewerApplication.pdfViewer.pdfDocument._pdfInfo.numPages) {
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

    let rmUserPrefsString = localStorage.getItem("rmUserPrefs");
    if (!rmUserPrefsString){
        rmUserPrefs = new ReadingMapPreferences();
        localStorage.setItem("rmUserPrefs", JSON.stringify(rmUserPrefs));
    }
    else{
        rmUserPrefs = new ReadingMapPreferences(rmUserPrefsString);
    }
    
    // Initialize pdfMetadata with real data acquired from the viewer.
    pdfMetadata = new ReadingMapMetadata();
    
    // Check if we have records for this pdf.
    // TODO: Extend the memory to chrome.Storage(Which has unlimited storage.)
    if (rmMetadataSet.has(pdfMetadata.toString())){
        // TODO: This direct method may cause problems.
        pdfRecord = new ReadingMapRecord(localStorage.getItem(pdfMetadata.toString()));
    }
    else{
        pdfRecord = new ReadingMapRecord();
        localStorage.setItem(pdfMetadata.toString(), pdfRecord.toString());
        rmMetadataSet.add(pdfMetadata.toString());
        localStorage.setItem("rmMetadataSet", JSON.stringify(Array.from(rmMetadataSet)));
    }
    
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

    // Save the changes.
    localStorage.setItem(pdfMetadata.toString(), pdfRecord.toString());
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
    let color = rmUserPrefs.getBarColor(times);
    rect.setAttribute("fill", color);
}


function rmRenderBar(){
    for (let i=0; i<pdfMetadata.pages; i++){
        rmSetPageColor(i, pdfRecord.readTimes[i]);
    }
}