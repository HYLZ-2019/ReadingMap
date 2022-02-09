console.log("Hello Map!");

var rmPreviousPage = 1;

window.addEventListener("load", viewerOnLoad);

function viewerOnLoad(){
    window.addEventListener("wheel", rmUpdate);
    window.addEventListener("click", rmUpdate);
    window.addEventListener("keydown", rmUpdate);
    rmPreviousPage = rmGetCurrentPage();
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
    rmPreviousPage = currentpage;
    console.log("Page changed.");
}