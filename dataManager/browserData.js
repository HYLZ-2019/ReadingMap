
window.addEventListener("load", browserDataOnLoad);

function browserDataOnLoad(){
    document.getElementById("exportChosen").addEventListener("click", exportChosen);
    document.getElementById("deleteChosen").addEventListener("click", deleteChosen);
    document.getElementById("backHomepage").addEventListener("click", backHomepage);
    document.getElementById("summaryChosen").addEventListener("click", summaryChosen);
    let curstorage = JSON.parse(JSON.stringify(localStorage));
    let summaryChart1=document.getElementById("summaryChart1")
    let summaryChart2=document.getElementById("summaryChart2")
    summaryChart1.style.display='none'
    summaryChart2.style.display='none'
    let table = document.getElementById("storageListTable");
    table.innerHTML = "";
    showStorageTable(curstorage, table, "browser");
    
}
