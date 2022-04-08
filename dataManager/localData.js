

window.addEventListener("load", localDataOnLoad);

function localDataOnLoad(){
   
    document.getElementById("importChosen").addEventListener("click", importChosen);
    document.getElementById("backHomepage").addEventListener("click", backHomepage);
    document.getElementById("uploadButton").addEventListener("change", loadFileAndDisplay);
    document.getElementById("summaryChosen").addEventListener("click", summaryChosen);
    let summaryChart1=document.getElementById("summaryChart1")
    let summaryChart2=document.getElementById("summaryChart2")
    summaryChart1.style.display='none'
    summaryChart2.style.display='none'
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