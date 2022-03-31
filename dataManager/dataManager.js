

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

        let readpages = document.createElement("td");
        readpages.setAttribute("class", "readpagesCol");
        let readpages_cnt = 0;
        for (let i in record.readTimes){
            if (record.readTimes[i] > 0){
                readpages_cnt += 1;
            }
        }
        readpages.innerText = readpages_cnt;
        row.appendChild(readpages);

        // The "/" of "5/10"
        let slash = document.createElement("td");
        slash.setAttribute("class", "slashCol");
        slash.innerText = "/";
        row.appendChild(slash);

        let pages = document.createElement("td");
        pages.setAttribute("class", "pagesCol");
        pages.innerText = record.metadata.pages;
        row.appendChild(pages);

        // Latest timestamp
        let latestTS = document.createElement("td");
        latestTS.setAttribute("class", "latestTSCol");
        let maxTS = record.lastTime[0];
        for (let i in record.lastTime){
            if (record.lastTime[i] > maxTS){
                maxTS = record.lastTime[i];
            }
        }
        latestTS.innerText = maxTS;
        row.appendChild(latestTS);

        let bookmarks = document.createElement("td");
        bookmarks.setAttribute("class", "bookmarksCol");
        let bookmark_cnt = 0;
        for (let i in record.markers){
            if (record.markers[i]){
                bookmark_cnt += 1;
            }
        }
        bookmarks.innerText = bookmark_cnt;
        row.appendChild(bookmarks);

        // How much space tracing it takes up.
        let space = document.createElement("td");
        space.setAttribute("class", "spaceCol");
        let space_cnt = identity.length + JSON.stringify(record).length;
        space.innerText = space_cnt + "B";
        row.appendChild(space);

        table.appendChild(row);
    }
}