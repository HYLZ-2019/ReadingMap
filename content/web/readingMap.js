console.log("Hello Map!");



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

Date.prototype.Format = function(fmt)
{ //author: meizz
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
}

/** Function rmUpdate is called whenever the user may switch to another page. "Switching" may be caused by mouse wheel, click, or keyboard movement, so this callback should listen to any of these events. */
function rmUpdate(e){
    let currentpage = rmGetCurrentPage();
    if (currentpage == rmPreviousPage){
        // The page number is not changed.
        return;
    }
    
    // The page number has changed.
    // Reload the data to sync modifications by other tabs.
    pdfRecord = new ReadingMapRecord(localStorage.getItem(pdfMetadata.toString()));

    let timenow = new Date();
    if (timenow.getTime() - rmStartTime.getTime() > rmUserPrefs.minReadMilliseconds) {
        pdfRecord.readTimes[rmPreviousPage-1] += 1;
    }
    pdfRecord.lastTime[rmPreviousPage - 1] = timenow;
    //rmSetPageColor(rmPreviousPage-1, pdfRecord.readTimes[rmPreviousPage-1]);
    rmRenderBar();
    
    rmPreviousPage = currentpage;
    rmStartTime = timenow;

    // Save the changes.
    localStorage.setItem(pdfMetadata.toString(), pdfRecord.toString());
}

function rmInitializeBar(){
    let bar = document.getElementById("readingMapBarDiv");
    // Draw a rectangle for each page.
    for (let i=0; i<pdfMetadata.pages; i++){
        let rect = document.createElement("div");
        rect.setAttribute("class", "readingMapBarBlock");
        rect.addEventListener("click", function(){
            // Scroll to the corresponding page.
            let page = document.getElementsByClassName("page")[i];
            page.scrollIntoView();
            setTimeout(function(){
                // If we update immediately, the current page number will be wrong because it takes time for the page number to change.
                rmUpdate();
            }, 50);
        });
        
        // Marker that shows which page we are on.
        let tri = document.createElement("img");
        tri.setAttribute("class", "rmProgressMark");
        tri.setAttribute("src", "../../../rmImages/progressMark.png");
        tri.style.opacity = 0;
        rect.appendChild(tri); 
        bar.appendChild(rect);
    }
}

// Set the color of the rectangle for page pagenum according to the times it has been read.
function rmSetPageColor(pagenum, times){
    let rect = document.getElementById("readingMapBarDiv").childNodes[pagenum];
    let color = rmUserPrefs.getBarColor(times);
    rect.style.backgroundColor = color;
}


function rmRenderBar(){
    let marks = document.getElementsByClassName("rmProgressMark");
    let curpage = rmGetCurrentPage();
    console.log(curpage);
    for (let i=0; i<pdfMetadata.pages; i++){
        rmSetPageColor(i, pdfRecord.readTimes[i]);
        if (i == curpage-1){
            marks[i].style.opacity = 0.5;
        }
        else{
            marks[i].style.opacity = 0;
        }
    }
}