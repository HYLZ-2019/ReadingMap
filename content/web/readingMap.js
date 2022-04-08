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

var flag = 'abstractClosed';

window.addEventListener("load", viewerOnLoad);


function viewerOnLoad() {
    // Load rmMetadataSet. (It doesn't need to wait for pdfViewer.)

    rmMetadataSet = load("rmMetadataSet");

    // Wait for pdfViewer to load.
    let before = new Date();
    let checkExist = setInterval(function () {
        // Wait until the whole family is neither null nor undefined.
        if (window.PDFViewerApplication.pdfViewer && window.PDFViewerApplication.pdfViewer.pdfDocument && window.PDFViewerApplication.pdfViewer.pdfDocument._pdfInfo && window.PDFViewerApplication.pdfViewer.pdfDocument._pdfInfo.numPages && window.PDFViewerApplication.pdfViewer.pdfDocument._pdfInfo.fingerprint) {
            clearInterval(checkExist);
            completeLoad(before);
        }
    }, 10); // check every 100ms

    // If too much memory is used, alert the user.
    checkMemoryUsage();
}

function isBetter(s) {
    if (s == "pdf.js" || s == "document.pdf") return false;
    return true ;
}

function completeLoad(before) {
    let after = new Date();
    console.log("It took " + (after.getTime() - before.getTime()) + "ms for pdfViewer to load.");

    rmPreviousPage = rmGetCurrentPage();
    rmStartTime = new Date();

    rmUserPrefs = load("rmUserPrefs")

    // Initialize pdfMetadata with real data acquired from the viewer.
    pdfMetadata = new ReadingMapMetadata();

    // Check if we have records for this pdf.
    // TODO: Extend the memory to chrome.Storage(Which has unlimited storage.)
    if (rmMetadataSet.includes(pdfMetadata.toString())) {
        // TODO: This direct method may cause problems.
        pdfRecord = load(pdfMetadata.toString());
        if (isBetter(pdfMetadata.title)) {
            pdfRecord.metadata.title = pdfMetadata.title;
            save(pdfMetadata.toString(), pdfRecord); 
        } else pdfMetadata.title = pdfRecord.metadata.title;
    }
    else if (rmMetadataSet.includes(pdfMetadata.oldToString())) {
        // It was tracked in an old version -> convert it to new format.
        pdfRecord = load(pdfMetadata.oldToString());
        // Page 1 ~ notes[0]; Page pages ~ notes[pages-1]
        pdfRecord.notes = [];
        for (let i = 0; i < pdfRecord.metadata.pages; i++) {
            pdfRecord.notes.push("");
        }
        save(pdfMetadata.toString(), pdfRecord);
        remove(pdfMetadata.oldToString());
        rmMetadataSet.push(pdfMetadata.toString());
        rmMetadataSet.splice(rmMetadataSet.indexOf(pdfMetadata.oldToString()), 1); // Remove the previous item
        save("rmMetadataSet", rmMetadataSet);
    }
    else {
        pdfRecord = new ReadingMapRecord();
        save(pdfMetadata.toString(), pdfRecord);
        rmMetadataSet.push(pdfMetadata.toString());
        save("rmMetadataSet", rmMetadataSet);
    }
    rmInitializeNote();
    rmInitializeBar();
    rmRenderBar();

    window.addEventListener("wheel", rmUpdate);
    window.addEventListener("click", rmUpdate);
    window.addEventListener("keydown", rmUpdate);
    // document.addEventListener("keypress", rmKeypressCallback);

    // Touch them in case they are undefined
    load("rmUserPrefs");
    load("rmBooksToday");
    load("rmHistorySet");
}

function rmGetCurrentPage() {
    return window.PDFViewerApplication.pdfViewer._currentPageNumber;
}

Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

/** Function rmUpdate is called whenever the user may switch to another page. "Switching" may be caused by mouse wheel, click, or keyboard movement, so this callback should listen to any of these events. */
function rmUpdate(e) {
    let currentpage = rmGetCurrentPage();
    if (currentpage == rmPreviousPage) {
        // The page number is not changed.
        return;
    }

    // The page number has changed.
    // Reload the data to sync modifications by other tabs.
    pdfRecord = load(pdfMetadata.toString());

    // Reload the notes to this page
    let noteInput = document.querySelector('#noteInput')
    // let noteText=note.textContent
    noteInput.value = pdfRecord.notes[currentpage - 1]

    let timenow = new Date();
    if (timenow.getTime() - rmStartTime.getTime() > rmUserPrefs.minReadMilliseconds) {
        pdfRecord.readTimes[rmPreviousPage - 1] += 1;
        if (pdfRecord.readTimes[rmPreviousPage - 1] == 1) {
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

// function rmKeypressCallback(event){
//     if (event.key == "m"){
//         console.log("press M")
//         // The shortcut to add a marker is "m".
//         rmToggleMarker();
//     }
// }

function checkAbstract(pagenum, status = '') {
    if (status != '') flag = status;
    let abstract = document.querySelector('abstract' + pagenum);
    let abstractPoint = document.querySelector('#rmAbstractPoint' + pagenum);
    abstract.innerText = String(pdfRecord.notes[pagenum - 1]).split('\n')[0];
    switch (flag) {
        case 'abstractClosed': abstract.style.visibility = 'hidden';
            break;
        case 'abstractAll':
            abstract.style.visibility = (pdfRecord.notes[pagenum - 1] == "" ? 'hidden' : 'visible');
            break;
        case 'abstractMarked': abstract.style.visibility = (pdfRecord.notes[pagenum - 1] == "" ? 'hidden' : (pdfRecord.markers[pagenum] ? 'visible' : 'hidden'));
            break;
        case 'abstractFind': {
            let FindInput = document.getElementById("abstractFindInput").value;
            if (FindInput == "") break ;
            abstract.style.visibility = (String(pdfRecord.notes[pagenum - 1]).indexOf(FindInput) == -1 ? 'hidden' : 'visible');
            break;
        }
    }
    abstractPoint.style.visibility = abstract.style.visibility;
}

function rmInitializeNote() {
    let noteInput = document.querySelector("#noteInput")
    noteInput.onchange = function () {
        let currentpage = rmGetCurrentPage();

        pdfRecord = load(pdfMetadata.toString());

        pdfRecord.notes[currentpage - 1] = this.value
        console.log(currentpage + "page's note was changed to " + this.value)
        save(pdfMetadata.toString(), pdfRecord);
        checkAbstract(currentpage);
    }
}

function changePages(pagenum) {
    // Scroll to the corresponding page.
    let page = document.getElementsByClassName("page")[pagenum];
    page.scrollIntoView();
    setTimeout(function () {
        // If we update immediately, the current page number will be wrong because it takes time for the page number to change.
        rmUpdate();
    }, 50);
}

function rmInitializeBar() {
    let bar = document.getElementById("readingMapBarDiv");
    // Draw a rectangle for each page.
    for (let i = 0; i < pdfMetadata.pages; i++) {
        let rect = document.createElement("div");
        rect.setAttribute("class", "readingMapBarBlock");
        rect.addEventListener("click", function () {
            changePages(i);
        });
        bar.appendChild(rect);
    }
    // Marker showing the current position.
    let mark = document.createElement("img");
    mark.setAttribute("src", "../../rmImages/progressMark.png");
    mark.setAttribute("class", "rmProgressMark");
    bar.appendChild(mark);

    // Draw all markers added by user.
    for (let i = 0; i < pdfMetadata.pages; i++) {
        bar.appendChild(rmDrawMarker(i, pdfRecord.markers[i] ? 'visible' : 'hidden'));
    }

    for (let i = 0; i < pdfMetadata.pages; i++) {
        bar.appendChild(rmDrawAbstract(i, 'hidden'));
        bar.appendChild(rmDrawAbstractPoint(i, 'hidden'));
    }
}
function rmDrawMarker(pagenum, visibility) {
    let mark = document.createElement("marker" + pagenum);
    mark.setAttribute("class", "rmMarker");

    mark.style.top = String(Math.min((pagenum - 1) * 100 / pdfMetadata.pages, 98)) + "%";
    mark.style.visibility = visibility
    mark.addEventListener("click", function () {
        changePages(pagenum-1);
    });
    return mark;
}

function rmDrawAbstract(pagenum, visibility) {
    let Abstract = document.createElement("abstract" + pagenum);

    Abstract.setAttribute("class", "rmAbstract");

    Abstract.innerText = String(pdfRecord.notes[pagenum - 1]).split('\n')[0];

    Abstract.style.top = String(Math.min((pagenum - 1) * 100 / pdfMetadata.pages, 98)) + "%";

    Abstract.style.visibility = visibility;

    Abstract.addEventListener("click", function () {
        changePages(pagenum-1);
    });

    return Abstract;
}

function rmDrawAbstractPoint(pagenum, visibility) {
    let AbstractPoint = document.createElement("img" );
    AbstractPoint.setAttribute("src", "../../rmImages/point.png");
    AbstractPoint.setAttribute('id','rmAbstractPoint'+pagenum)
    AbstractPoint.setAttribute('class','rmAbstractPoint')
    AbstractPoint.style.top = String(Math.min((pagenum - 1) * 100 / pdfMetadata.pages, 99)) + "%";

    AbstractPoint.style.visibility = visibility;
    AbstractPoint.addEventListener("click", function () {
        changePages(pagenum);
    });
    AbstractPoint.addEventListener("mouseenter", function () {
        document.getElementsByTagName("abstract" + pagenum)[0].style.zIndex = 99999;
    });
    AbstractPoint.addEventListener("mouseleave", function () {
        document.getElementsByTagName("abstract" + pagenum)[0].style.zIndex = 3000;
    })
    return AbstractPoint;
}

function showSomeAbstracts(state) {
    // console.log(state)
    if (state === 'toggle') {
        let abstractButton = document.getElementById("abstractToolbar")
        console.log('abstractButton.style.visibility', abstractButton)
        if (abstractButton.style.visibility == 'visible')
            abstractButton.style.visibility = 'hidden'
        else abstractButton.style.visibility = 'visible'
        return
    }
    // flag = (flag + 1) % 3;
    for (let i = 0; i < pdfMetadata.pages; i++) {
        checkAbstract(i, state);
    }
}

// Set the color of the rectangle for page pagenum according to the times it has been read.
function rmSetPageColor(pagenum, times) {
    let rect = document.getElementById("readingMapBarDiv").childNodes[pagenum];
    let color = rmUserPrefs.getBarColor(times);
    rect.style.backgroundColor = color;
}


function rmRenderBar() {
    let mark = document.getElementsByClassName("rmProgressMark")[0];
    let curpage = rmGetCurrentPage();
    mark.style.top = String(Math.min((curpage - 1) * 100 / pdfMetadata.pages, 99)) + "%";

    for (let i = 0; i < pdfMetadata.pages; i++) {
        rmSetPageColor(i, pdfRecord.readTimes[i]);
    }
}

function markCurrentPage() {
    let pagenum = rmGetCurrentPage();
    console.log("mark page");
    // Reload the data to sync modifications by other tabs.
    pdfRecord = load(pdfMetadata.toString());
    let mark = document.querySelector('marker' + pagenum)
    pdfRecord.markers[pagenum] = !pdfRecord.markers[pagenum];

    if (mark.style.visibility == 'hidden')
        mark.style.visibility = 'visible'
    else mark.style.visibility = 'hidden'
    checkAbstract(pagenum);
    // Save the changes.
    save(pdfMetadata.toString(), pdfRecord);

}



function rmNewPageToday() {
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
    for (let i in today.history) {
        let book = today.history[i];
        if (book.title == pdfMetadata.title) {
            book.pages += 1;
            found = 1;
            break;
        }
    }
    if (found == 0) {
        let book = new ReadingMapSimpleHistory();
        book.title = pdfMetadata.title;
        book.pages = 1;
        today.history.push(book);
    }
    save("rmBooksToday", today);
    console.log(today);
}


// Check how much memory is used up.
function checkMemoryUsage() {
    let usage = JSON.stringify(localStorage).length;
    let MBs = usage / (1000 * 1000);
    if (MBs > 4.5) {
        alert('ReadingMap当前已经占用了 ' + MBs + 'MB / 5MB = ' + MBs / 5 + '% 的可用空间，请您尽快前往"数据管理器"中导出数据并清理空间~');
    }
}