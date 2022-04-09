
function backHomepage()
{
    window.location.href="chrome-extension://"+chrome.runtime.id+"/dataManager/homepage.html"
    // chrome.tabs.create({url: "chrome-extension://"+chrome.runtime.id+"/dataManager/homepage.html"})
}
function showBrowserData(){
    window.location.href="chrome-extension://"+chrome.runtime.id+"/dataManager/browserData.html"
}
function openLocalData(){
    window.location.href="chrome-extension://"+chrome.runtime.id+"/dataManager/localData.html"
}
function mergeFiles(){
    window.location.href="chrome-extension://"+chrome.runtime.id+"/dataManager/mergeFiles.html"
document.getElementById("showConflictArea").style.display="none";
}
var uploadedStorage;

function loadFileAndDisplay(){
    var file = document.getElementById('uploadButton').files[0];
    var reader = new FileReader();
    reader.onload = function () {
        uploadedStorage = JSON.parse(reader.result);
        let table = document.getElementById("storageListTable");
        table.innerHTML = "";
        showStorageTable(uploadedStorage, table, "local");
        document.getElementById("importChosen").style.display="flex";
    }
    reader.readAsText(file, 'utf-8');
}

function exportChosen(){
    let table = document.getElementById("storageListTable");
    let keylist = getAllSelectedKeys(table);
    let storage = exportStorageFromList(localStorage, keylist);
    downloadData(storage);
    
}

function downloadData(storage){
    let temp = document.createElement('a');
    temp.download = "Data_" + new Date().toJSON() + ".rmrf";
    temp.href = 'data:text/plain;charset=utf-8,' + JSON.stringify(storage);
    temp.dispatchEvent(new MouseEvent('click'));
}


function importChosen(){
    if (uploadedStorage==undefined) return
    let s1 = JSON.parse(JSON.stringify(localStorage));
    
    let table = document.getElementById("storageListTable");
    let keylist = getAllSelectedKeys(table);
    let s2 = exportStorageFromList(uploadedStorage, keylist);

    showConflicts(s1, s2, document.getElementById("conflictTable"));

    document.getElementById("confirmMerge").addEventListener("click", function(){
        let newstorage = mergeTwoStorages(s1, s2, getMergeModeDict());
        for (key in newstorage){
            localStorage[key] = newstorage[key];
        }
        alert("数据导入成功！");
        location.reload();
    });
}


function deleteChosen(){
    let table = document.getElementById("storageListTable");
    let keylist = getAllSelectedKeys(table);
    let keylistlen = keylist.length;
    let totallen = 0;
    if (confirm("确认从浏览器中删除 "+keylistlen+" 条阅读数据？")){
        for (let i=0; i<keylistlen; i++){
            key = keylist[i];
            totallen += key.length;
            totallen += localStorage[key].length;
            let metaset = load("rmMetadataSet");
            metaset.splice(metaset.indexOf(key), 1);
            save("rmMetadataSet", metaset);
            remove(key);
        }
        alert("成功删除"+keylistlen+" 条阅读数据，释放了 "+totallen+" B 空间！");
        location.reload();
    }
}



var storageToMerge1;
var storageToMerge2;
function checkBothInputsForRead(){
    let f1 = document.getElementById("mergeInput1").files[0];
    let f2 = document.getElementById("mergeInput2").files[0];
    if (f1 != undefined && f2 != undefined){
        let reader1 = new FileReader();
        reader1.onload = function () {
            storageToMerge1 = JSON.parse(reader1.result);
            let reader2 = new FileReader();
            reader2.onload = function () {
                storageToMerge2 = JSON.parse(reader2.result);
                // Let the one with later dumpTime be s1.
                let s1, s2;
                if (storageToMerge1["dumpTime"] > storageToMerge2["dumpTime"]){
                    s1 = storageToMerge1;
                    s2 = storageToMerge2;
                }
                else{
                    s1 = storageToMerge2;
                    s2 = storageToMerge1;
                }
                showConflicts(s1, s2, document.getElementById("conflictTable"));
                document.getElementById("confirmMerge").addEventListener("click", function(){
                    let newstorage = mergeTwoStorages(s1, s2, getMergeModeDict());
                    downloadData(newstorage);
                });
            }
            reader2.readAsText(f2, 'utf-8');
        }
        reader1.readAsText(f1, 'utf-8');
        
    }
}



function showStorageTable(storage, table, origin){
    let spacemessage = "";
    let curspace = JSON.stringify(storage).length;
    if (origin == "browser"){
        if (navigator.language == "zh-CN"){
            spacemessage = "当前占用空间：" + curspace + "B = " + curspace/(1000*1000) + "MB，总可用空间：5MB，剩余：" + (1-curspace/(1000*1000*5))*100 + "%。";
        }
        else{
            spacemessage = "Currently used space: " + curspace + "B = " + curspace/(1000*1000) + "MB, Total available space: 5MB, Remaining: " + (1-curspace/(1000*1000*5))*100 + "%.";
        }
    }
    else if (origin == "local"){
        if (navigator.language == "zh-CN"){
            spacemessage = "文件总大小：" + curspace + "B = " + curspace/(1000*1000) + "MB";
        }
        else {
            spacemessage = "Total size of file: " + curspace + "B = " + curspace/(1000*1000) + "MB";
        }
    }
    document.getElementById("totalSize").innerText = spacemessage;

    let row = document.createElement("tr");   
    row.setAttribute("class", "storageListRow")
    
    let checkboxtd = document.createElement("th");
    checkboxtd.setAttribute("class","checkboxCol");
    let checkall = document.createElement("input");
    checkall.setAttribute("type", "checkbox");
    checkall.setAttribute("class", "checkAllCheckbox");
    checkall.addEventListener("click", function(){
        checkAll(checkall, table, "chooseCheckbox");
    })
    checkboxtd.appendChild(checkall);
    row.appendChild(checkboxtd);
    
    let fingerprint = document.createElement("th");
    fingerprint.setAttribute("class", "fingerprintCol");
    fingerprint.setAttribute("data-l10n-id", "fileFingerprint_label");
    fingerprint.innerText = "File fingerprint";
    row.appendChild(fingerprint);

    let title = document.createElement("th");
    title.setAttribute("class", "titleCol");
    title.setAttribute("data-l10n-id", "title_label");
    title.innerText = "File title";
    row.appendChild(title);

    let path = document.createElement("th");
    path.setAttribute("class", "pathCol");
    path.setAttribute("data-l10n-id", "path_label");
    path.innerText = "File path";
    row.appendChild(path);

    let firstpagenote = document.createElement("th");
    firstpagenote.setAttribute("class", "firstpagenoteCol");
    firstpagenote.innerText = "Notes on first page";
    firstpagenote.setAttribute("data-l10n-id", "firstpagenote_label");
    row.appendChild(firstpagenote);

    let readpages = document.createElement("th");
    readpages.setAttribute("class", "readpagesCol");
    readpages.innerText = "Read pages";
    readpages.setAttribute("data-l10n-id", "readpages_label");
    row.appendChild(readpages);

    // The "/" of "5/10"
    let slash = document.createElement("th");
    slash.setAttribute("class", "slashCol");
    slash.innerText = "/";
    row.appendChild(slash);

    let pages = document.createElement("th");
    pages.setAttribute("class", "pagesCol");
    pages.innerText = "Total pages";
    pages.setAttribute("data-l10n-id", "totalpages_label");
    row.appendChild(pages);

    // Latest timestamp
    let latestTS = document.createElement("th");
    latestTS.setAttribute("class", "latestTSCol");
    latestTS.setAttribute("data-l10n-id", "latestTS_label");
    latestTS.innerText = "Latest read time";
    row.appendChild(latestTS);

    let bookmarks = document.createElement("th");
    bookmarks.setAttribute("class", "bookmarksCol");
    bookmarks.setAttribute("data-l10n-id", "bookmarkcnt_label");
    bookmarks.innerText = "Bookmark count";
    row.appendChild(bookmarks);

    // How much space tracing it takes up.
    let space = document.createElement("th");
    space.setAttribute("class", "spaceCol");
    space.setAttribute("data-l10n-id", "space_label");
    space.innerText = "Space used";
    row.appendChild(space);

    table.appendChild(row);


    var rmMetadataList = JSON.parse(storage["rmMetadataSet"]);
    for (metaI in rmMetadataList){
        let identity = rmMetadataList[metaI];
        // ReadingMapRecord record
        let record = JSON.parse(storage[identity]);
        let row = document.createElement("tr");   
        row.setAttribute("class", "storageListRow")
        
        let checkboxtd = document.createElement("td");
        checkboxtd.setAttribute("class","checkboxCol");
        let checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("class", "chooseCheckbox");
        checkbox.checked = false;
        checkboxtd.appendChild(checkbox);
        row.appendChild(checkboxtd);
        
        let fingerprint = document.createElement("td");
        fingerprint.setAttribute("class", "fingerprintCol");
        fingerprint.innerText = record.metadata.fingerprint;
        row.appendChild(fingerprint);

        let title = document.createElement("td");
        title.setAttribute("class", "titleCol");
        title.innerText = record.metadata.title;
        row.appendChild(title);

        let path = document.createElement("td");
        path.setAttribute("class", "pathCol");
        path.innerText = record.metadata.path;
        row.appendChild(path);

        let firstpagenote = document.createElement("td");
        firstpagenote.setAttribute("class", "firstpagenoteCol");
        firstpagenote.innerText = record.notes ? record.notes[0] : "";
        row.appendChild(firstpagenote);

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

function mergeTwoStorages(s1, s2, addMap){
    // s1 and s2 are both localStorage objects.
    // s1 should be the smaller and newer one.
    // The main keys of localStorages are:
    // rmMetadataSet: List of all tracked pdf metadatas. Should be merged by creating union of two lists.
    // rmUserPrefs: The user's preferences(such as bar color). Should be merged by using the newer version.
    // rmBooksToday: Because previous "rmBooksToday" won't be cleaned up and will be added to the new storage's rmHistorySet, so we should be able to directly use the new version rmBooksToday.
    // rmHistorySet: Merge by creating union. If two items have the same date, keep the newer one.
    // ReadingMapRecords: If one key corresponds to two values, let the user choose which ones to merge with "Add Mode" and which ones to merge with "Replace Mode" by passing in list of Add Mode keys through addMap. 
    // addMap[Key] == undefined if there is no conflict in Key; == True if the user chooses to merge Key with Add Mode; == False if the user chooses to merge Key with Overwrite Mode.

    let newStorage = {}
    
    // Merge rmMetadataSet
    let metadataSet1 = JSON.parse(s1["rmMetadataSet"]);
    let metadataSet2 = JSON.parse(s2["rmMetadataSet"]);
    let newMetadataSet = new Set();
    for (i in metadataSet1){
        newMetadataSet.add(metadataSet1[i]);
    }
    for (i in metadataSet2){
        newMetadataSet.add(metadataSet2[i]);
    }
    let newMetadataList = Array.from(newMetadataSet);

    newStorage["rmMetadataSet"] = JSON.stringify(newMetadataList);

    // Merge rmUserPrefs
    // Use parse+stringify to implement deep copy
    newStorage["rmUserPrefs"] = s1["rmUserPrefs"];

    // Merge rmBooksToday
    newStorage["rmBooksToday"] = s1["rmBooksToday"];
    
    // Merge rmHistorySet
    // The object stored in localStorage is actually a list.
    let historydict = {};
    let history1 = JSON.parse(s1["rmHistorySet"]);
    let history2 = JSON.parse(s2["rmHistorySet"]);
    for (let i in history2){
        historydict[history2[i].date] = history2[i];
    }
    // Use history1 on conflict
    for (let i in history1){
        historydict[history1[i].date] = history1[i];
    }
    let historyArray = [];
    for (let key in historydict){
        historyArray.push(historydict[key]);
    }
    newStorage["rmHistorySet"] = JSON.stringify(historyArray);

    // Merge all the readingMapRecords.
    for (let i in newMetadataList){
        let key = newMetadataList[i];
        if (addMap[key] == undefined){
            // No conflict, only one storage has it.
            if (s1[key] == undefined && s2[key] != undefined){
                newStorage[key] = s2[key];
            }
            else if (s1[key] != undefined && s2[key] == undefined){
                newStorage[key] = s1[key];
            }
            else{
                console.log("Error: No record in neither storage!");
            }
        }
        else if (addMap[key] == "overwrite"){
            // Overwrite Mode, use the newer s1 version.
            newStorage[key] = s1[key];
        }
        else if (addMap[key] == "add"){
            // Add Mode.
            // Based on s1.
            let record = JSON.parse(s1[key]);
            let r2 = JSON.parse(s2[key]);
            // record.metadata should be the same.
            let pages = record.metadata.pages;
            for (let i=0; i<pages; i++){
                record.readTimes[i] = record.readTimes[i] + r2.readTimes[i];
                if (record.notes[i] != "" || r2.notes[i] != ""){
                    record.notes[i] = record.notes[i] + "\n\n" + r2.notes[i];
                }
                record.markers[i] = record.markers[i] || r2.markers[i];
                if (r2.lastTime[i] > record.lastTime[i]){
                    record.lastTime[i] = r2.lastTime[i];
                }
            }
            // createTime should be min of two.
            if (r2.createTime < record.createTime){
                record.createTime = r2.createTime;
            }

            newStorage[key] = JSON.stringify(record);
        }
    }
    
    return newStorage;
}

function getAllSelectedKeys(table){
    let selected = [];
    let rows = table.getElementsByTagName("tr");
    for (i=0; i<rows.length; i++){
        let row = rows[i];
        let cb = row.getElementsByClassName("checkboxCol")[0].getElementsByClassName("chooseCheckbox")[0];
        if (cb != undefined && cb.checked){
            let fingerprint = row.getElementsByClassName("fingerprintCol")[0].innerText;
            let pages = Number(row.getElementsByClassName("pagesCol")[0].innerText);
            let key = JSON.stringify({pages:pages, fingerprint:fingerprint});
            selected.push(key);
        }
    }
    return selected;
}

// Export a part of localStorage according to keyList.
function exportStorageFromList(bigstorage, keyList){
    let storage = {};
    storage["rmMetadataSet"] = JSON.stringify(keyList);
    storage["rmUserPrefs"] = bigstorage["rmUserPrefs"];
    storage["rmBooksToday"] = bigstorage["rmBooksToday"];
    storage["rmHistorySet"] = bigstorage["rmHistorySet"];
    for (let i=0; i<keyList.length; i++){
        let key = keyList[i];
        storage[key] = bigstorage[key];
    }
    // Record the dump time.
    storage["dumpTime"] = new Date().toJSON();
    return storage;
}

function checkAll(box, table, boxclass){
    let others = table.getElementsByClassName(boxclass);
    for (let i=0; i<others.length; i++){
        others[i].checked = box.checked;
    }
}

function showConflicts(s1, s2, table){
    let leftcolor = "lightblue";
    let rightcolor = "lightyellow";

    let conflictList = [];
    let metaset1 = new Set(JSON.parse(s1["rmMetadataSet"]));
    let metalist2 = JSON.parse(s2["rmMetadataSet"]);
    for (let i=0; i<metalist2.length; i++){
        let key = metalist2[i];
        if (metaset1.has(key)){
            conflictList.push(key);
        }
    }

    let conflictNumber = document.getElementById("conflictNumber");
    if (conflictList.length == 0){
        conflictNumber.innerText = navigator.language=="zh-CN"?"要合并的数据没有冲突~":"No conflict detected from merge.";
    }
    else{
        conflictNumber.innerText = navigator.language=="zh-CN"?"数据合并中共产生 "+conflictList.length + " 个冲突，请选择合并模式后在清单下方确认。":"Please choose merge mode for the " + conflictList.length + " conflicts detected before confirming merge.";
    }
    conflictNumber.scrollIntoView();
    table.innerHTML = "";

    // Table head
    let row = document.createElement("tr");

    let mergeModeButtonCol = document.createElement("th");
    mergeModeButtonCol.setAttribute("data-l10n-id", "mergeMode_label");
    mergeModeButtonCol.innerText = "Merge Mode";
    row.append(mergeModeButtonCol);
    
    let fingerprint = document.createElement("th");
    fingerprint.setAttribute("class", "fingerprintCol");
    fingerprint.setAttribute("data-l10n-id", "fileFingerprint_label");
    fingerprint.innerText = "File fingerprint";
    row.appendChild(fingerprint);

    let title = document.createElement("th");
    title.setAttribute("class", "titleCol");
    title.setAttribute("data-l10n-id", "title_label");
    title.innerText = "File title";
    row.appendChild(title);

    let pages = document.createElement("th");
    pages.setAttribute("class", "pagesCol");
    pages.setAttribute("data-l10n-id", "totalpages_label");
    pages.innerText = "Total pages";
    row.appendChild(pages);

    // How much space tracing it takes up.
    let space1 = document.createElement("th");
    space1.setAttribute("class", "spaceCol");
    space1.setAttribute("data-l10n-id", "space1_label");
    space1.innerText = "Space of 1";
    space1.style.backgroundColor = leftcolor;
    row.appendChild(space1);

    let createTime1 = document.createElement("th");
    createTime1.setAttribute("class", "createTimeCol");
    createTime1.setAttribute("data-l10n-id", "createTime1_label");
    createTime1.innerText = "Creation time of 1";
    createTime1.style.backgroundColor = leftcolor;
    row.appendChild(createTime1);
    
    // How much space tracing it takes up.
    let space2 = document.createElement("th");
    space2.setAttribute("class", "spaceCol");
    space2.setAttribute("data-l10n-id", "space2_label");
    space2.innerText = "Space of 2";
    space2.style.backgroundColor = rightcolor;
    row.appendChild(space2);

    let createTime2 = document.createElement("th");
    createTime2.setAttribute("class", "createTimeCol");
    createTime2.setAttribute("data-l10n-id", "createTime2_label");
    createTime2.innerText = "Creation time of 2";
    createTime2.style.backgroundColor = rightcolor;
    row.appendChild(createTime2);

    table.appendChild(row);


    for (let i=0; i<conflictList.length; i++){
        let key = conflictList[i];
        let r1 = JSON.parse(s1[key]);
        let r2 = JSON.parse(s2[key]);
        let row = document.createElement("tr");

        let mergeModeButtonCol = document.createElement("td");
        let mergeModeButton = createMergeModeButton();
        // Suggest merge mode.
        if (r1.createTime > s2["dumpTime"]){
            // The record probably was exported -> deleted -> created again
            mergeModeButton.changeTo("add");
        }
        else{
            // The record was exported, but the original copy wasn't deleted
            mergeModeButton.changeTo("overwrite");
        }
        mergeModeButtonCol.appendChild(mergeModeButton);
        row.append(mergeModeButtonCol);
        
        let fingerprint = document.createElement("td");
        fingerprint.setAttribute("class", "fingerprintCol");
        fingerprint.innerText = r1.metadata.fingerprint;
        row.appendChild(fingerprint);

        let title = document.createElement("td");
        title.setAttribute("class", "titleCol");
        title.innerText = r1.metadata.title;
        row.appendChild(title);

        let pages = document.createElement("td");
        pages.setAttribute("class", "pagesCol");
        pages.innerText = r1.metadata.pages;
        row.appendChild(pages);

        // How much space tracing it takes up.
        let space1 = document.createElement("td");
        space1.setAttribute("class", "spaceCol");
        let space_cnt_1 = key.length + JSON.stringify(r1).length;
        space1.innerText = space_cnt_1 + "B";
        space1.style.backgroundColor = leftcolor;
        row.appendChild(space1);

        let createTime1 = document.createElement("td");
        createTime1.setAttribute("class", "createTimeCol");
        createTime1.innerText = r1.createTime;
        createTime1.style.backgroundColor = leftcolor;
        row.appendChild(createTime1);
        
        // How much space tracing it takes up.
        let space2 = document.createElement("td");
        space2.setAttribute("class", "spaceCol");
        let space_cnt_2 = key.length + JSON.stringify(r2).length;
        space2.innerText = space_cnt_2 + "B";
        space2.style.backgroundColor = rightcolor;
        row.appendChild(space2);

        let createTime2 = document.createElement("td");
        createTime2.setAttribute("class", "createTimeCol");
        createTime2.innerText = r2.createTime;
        createTime2.style.backgroundColor = rightcolor;
        row.appendChild(createTime2);

        table.appendChild(row);
    }

    document.getElementById("showConflictArea").style.display="flex";
    document.webL10n.translate();
}

function createMergeModeButton(){
    let button = document.createElement("div")
    button.setAttribute("class", "mergeModeButton");
    button.mode = "overwrite"; // or "add"
    button.changeTo = function(dst){
        if (dst == "add"){
            button.mode = "add";
            button.style.backgroundImage='url("../rmImages/add.png")';
        }
        else if (dst == "overwrite"){
            button.mode = "overwrite";
            button.style.backgroundImage = 'url("../rmImages/overwrite.png")';
        }
    }
    button.onclick = function(){
        if (button.mode == "overwrite"){
            button.changeTo("add");
        }
        else if (button.mode == "add"){
            button.changeTo("overwrite");
        }
    }
    return button;
}

function getMergeModeDict(){
    let modeDict = {};
    let table = document.getElementById("conflictTable");
    let rows = table.getElementsByTagName("tr");
    for (i=0; i<rows.length; i++){
        let row = rows[i];
        let mm = row.getElementsByClassName("mergeModeButton")[0];
        if (mm != undefined) {
            let fingerprint = row.getElementsByClassName("fingerprintCol")[0].innerText;
            let pages = Number(row.getElementsByClassName("pagesCol")[0].innerText);
            let key = JSON.stringify({pages:pages, fingerprint:fingerprint});
            
            modeDict[key] = mm.mode;
        }
    }
    return modeDict;
}