
window.addEventListener("load", browserDataOnLoad);

function browserDataOnLoad(){
    document.getElementById("exportChosen").addEventListener("click", exportChosen);
    document.getElementById("deleteChosen").addEventListener("click", deleteChosen);
    document.getElementById("backHomepage").addEventListener("click", backHomepage);
    let curstorage = JSON.parse(JSON.stringify(localStorage));

    let table = document.getElementById("storageListTable");
    table.innerHTML = "";
    showStorageTable(curstorage, table, "browser");
    
}
