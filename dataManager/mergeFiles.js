

window.addEventListener("load", mergeFilesOnLoad);

function mergeFilesOnLoad(){
    
    document.getElementById("backHomepage").addEventListener("click", backHomepage);
    document.getElementById("mergeInput1").addEventListener("change", checkBothInputsForRead);
    document.getElementById("mergeInput2").addEventListener("change", checkBothInputsForRead);
    document.getElementById("showConflictArea").style.display="none";
}