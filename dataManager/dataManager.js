

window.addEventListener("load", dataManagerOnLoad);

function dataManagerOnLoad(){
    showStorageTable();
}

function showStorageTable(){
    let rmMetadataList = load("rmMetadataSet");
    let table = document.getElementById("storageListTable");
    for (metaI in rmMetadataList){
        let identity = rmMetadataList[metaI]
        // ReadingMapRecord record
        let record = load(identity);
        let row = document.createElement("tr");   
        row.setAttribute("class", "storageListRow")     
        
        let fingerprint = document.createElement("td");
        fingerprint.setAttribute("class", "fingerprintCol");
        fingerprint.innerText = record.metadata.fingerprint;
        row.appendChild(fingerprint);

        let title = document.createElement("td");
        title.setAttribute("class", "titleCol");
        title.innerText = record.metadata.title;
        row.appendChild(title);

        let pages = document.createElement("td");
        pages.setAttribute("class", "pagesCol");
        pages.innerText = record.metadata.pages;
        row.appendChild(pages);


        table.appendChild(row);
    }
}