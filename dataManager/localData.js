

window.addEventListener("load", localDataOnLoad);

function localDataOnLoad(){
   
    document.getElementById("importChosen").addEventListener("click", importChosen);
    document.getElementById("backHomepage").addEventListener("click", backHomepage);
    document.getElementById("uploadButton").addEventListener("change", loadFileAndDisplay);
    
    document.getElementById("showConflictArea").style.display="none";
    let table = document.getElementById("storageListTable");
    if (uploadedStorage == undefined){
        table.innerHTML = "";
        document.getElementById("totalSize").innerText = "";
    }
    else{
        table.innerHTML = "";
        showStorageTable(uploadedStorage, table, "local");
    }

}