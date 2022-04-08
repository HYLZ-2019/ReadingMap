

window.addEventListener("load", localDataOnLoad);

function localDataOnLoad(){
//    alert('localDataOnLoad')
    document.getElementById("importChosen").addEventListener("click", importChosen);
    document.getElementById("backHomepage").addEventListener("click", backHomepage);
    document.getElementById("uploadButton").addEventListener("change", loadFileAndDisplay);
    document.getElementById("summaryChosen").addEventListener("click", summaryChosenFromLocal);
    let summaryChart1=document.getElementById("summaryChart1")
    let summaryChart2=document.getElementById("summaryChart2")
    summaryChart1.style.display='none'
    summaryChart2.style.display='none'
    document.getElementById("showConflictArea").style.display="none";
    let table = document.getElementById("storageListTable");
    table.innerHTML = "";
    document.getElementById("totalSize").innerText = "";
    uploadedStorage=undefined
    

}