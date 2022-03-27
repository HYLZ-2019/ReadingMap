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

// The History set
var rmHistorySet;

window.addEventListener("load", viewerOnLoad);


function viewerOnLoad(){
    // Load rmMetadataSet. (It doesn't need to wait for pdfViewer.)

    rmMetadataSet = load("rmMetadataSet");

    // Wait for pdfViewer to load.
    let before = new Date();
    let checkExist = setInterval(function() {
        // Wait until the whole family is neither null nor undefined.
        if (window.PDFViewerApplication.pdfViewer && window.PDFViewerApplication.pdfViewer.pdfDocument && window.PDFViewerApplication.pdfViewer.pdfDocument._pdfInfo && window.PDFViewerApplication.pdfViewer.pdfDocument._pdfInfo.numPages && window.PDFViewerApplication.pdfViewer.pdfDocument._pdfInfo.fingerprint) {
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

    rmUserPrefs = load("rmUserPrefs")
    
    // Initialize pdfMetadata with real data acquired from the viewer.
    pdfMetadata = new ReadingMapMetadata();
    
    // Check if we have records for this pdf.
    // TODO: Extend the memory to chrome.Storage(Which has unlimited storage.)
    if (rmMetadataSet.has(pdfMetadata.toString())){
        // TODO: This direct method may cause problems.
        pdfRecord = load(pdfMetadata.toString());
    }
    else{
        pdfRecord = new ReadingMapRecord();
        save(pdfMetadata.toString(), pdfRecord);
        rmMetadataSet.add(pdfMetadata.toString());
        save("rmMetadataSet", rmMetadataSet);
    }
    rmInitializeNote();
    rmInitializeBar();
    rmRenderBar();
    
    window.addEventListener("wheel", rmUpdate);
    window.addEventListener("click", rmUpdate);
    window.addEventListener("keydown", rmUpdate);
    document.addEventListener("keypress", rmKeypressCallback);
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
    pdfRecord = load(pdfMetadata.toString());

    // Reload the notes to this page
    let noteInput=document.querySelector('#noteInput')
    // let noteText=note.textContent
    noteInput.value=pdfRecord.notes[currentpage]

    let timenow = new Date();
    if (timenow.getTime() - rmStartTime.getTime() > rmUserPrefs.minReadMilliseconds) {
        pdfRecord.readTimes[rmPreviousPage-1] += 1;
        if (pdfRecord.readTimes[rmPreviousPage-1] == 1){
            // A newly read page
            rmNewPageToday();
        }
    }
    pdfRecord.lastTime[rmPreviousPage - 1] = timenow;
    //rmSetPageColor(rmPreviousPage-1, pdfRecord.readTimes[rmPreviousPage-1]);
    rmRenderBar();
    
    rmPreviousPage = currentpage;
    rmStartTime = timenow;

    // Save the changes.
    save(pdfMetadata.toString(), pdfRecord);
}

function rmKeypressCallback(event){
    if (event.key == "m"){
        // The shortcut to add a marker is "m".
        rmAddMarker();
    }
}
function rmInitializeNote()
{
    let noteInput=document.querySelector("#noteInput")
    noteInput.onchange=function(){
        let currentpage = rmGetCurrentPage();
        
        pdfRecord = load(pdfMetadata.toString());

        pdfRecord.notes[currentpage]=this.value
        console.log(currentpage+"page's note was changed to "+this.value)
        save(pdfMetadata.toString(), pdfRecord);
    }
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
        bar.appendChild(rect);
    }
    // Marker showing the current position.
    let mark = document.createElement("img");
    mark.setAttribute("src", "../../rmImages/progressMark.png");
    mark.setAttribute("class", "rmProgressMark");
    bar.appendChild(mark);

    // Draw all markers added by user.
    let i; // ReadingMapMarker
    for (i in pdfRecord.markers){
        let marker = pdfRecord.markers[i];
        rmDrawMarker(marker);
    }
}

// Set the color of the rectangle for page pagenum according to the times it has been read.
function rmSetPageColor(pagenum, times){
    let rect = document.getElementById("readingMapBarDiv").childNodes[pagenum];
    let color = rmUserPrefs.getBarColor(times);
    rect.style.backgroundColor = color;
}


function rmRenderBar(){
    let mark = document.getElementsByClassName("rmProgressMark")[0];
    let curpage = rmGetCurrentPage();
    mark.style.top = String(Math.min((curpage-1)*100/pdfMetadata.pages, 99)) + "%";

    for (let i=0; i<pdfMetadata.pages; i++){
        rmSetPageColor(i, pdfRecord.readTimes[i]);
    }
}

function rmAddMarker(){
    let mark = new ReadingMapMarker();
    mark.pagenum = rmGetCurrentPage();
    
    // Reload the data to sync modifications by other tabs.
    pdfRecord = load(pdfMetadata.toString());

    pdfRecord.markers.push(mark);

    // Save the changes.
    save(pdfMetadata.toString(), pdfRecord);

    rmDrawMarker(mark);
}

function rmDrawMarker(marker) {
    let mark = document.createElement("img");
    mark.setAttribute("class", "rmMarker");
    mark.setAttribute("src", marker.imagesrc);
    // TODO: This position isn't very accurate.
    mark.style.top = String(Math.min((marker.pagenum-1)*100/pdfMetadata.pages, 98)) + "%";
    let bar = document.getElementById("readingMapBarDiv");
    bar.appendChild(mark);
}

function rmNewPageToday(){
    let today = load("rmBooksToday");
    let found = 0;
    console.log(today);
    let cur = new Date();
    let lastTime = new Date(today.date);
    console.log(lastTime);
    console.log(cur);
    if (lastTime.toDateString() != cur.toDateString()) {
        rmHistorySet = load("rmHistorySet");
        rmHistorySet.add(today);
        save("rmHistorySet", rmHistorySet);
        // console.log(rmHistorySet);
        today = new ReadingMapDayHistory();
    }
    for (let i in today.history){
        let book = today.history[i];
        if (book.title == pdfMetadata.title){
            book.pages += 1;
            found = 1;
            break;
        }
    }
    if (found == 0){
        let book = new ReadingMapSimpleHistory();
        book.title = pdfMetadata.title;
        book.pages = 1;
        today.history.push(book);
    }
    save("rmBooksToday", today);
    console.log(today);
}