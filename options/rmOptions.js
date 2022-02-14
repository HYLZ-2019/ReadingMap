document.getElementById("rmSaveButton").addEventListener("click", rmSaveAllOptions);
var rmUserPrefs = rmLoadUserPrefs();
rmShowPreferences(rmUserPrefs);

function rmLoadUserPrefs(){
    let prefString = localStorage.getItem("rmUserPrefs");
    let prefs = null;
    if (!prefString){
        prefs = new ReadingMapPreferences();
        localStorage.setItem("rmUserPrefs", JSON.stringify(prefs));
    }
    else{
        prefs = new ReadingMapPreferences(prefString);
    }
    return prefs;
}


function rmShowPreferences(prefs){
    // prefs is a ReadingMapPreferences object.
    document.getElementById("minReadSeconds").setAttribute("value", prefs.minReadMilliseconds / 1000);

}

function rmSaveAllOptions(){
    // Get data from options page.
    minReadSeconds = document.getElementById("minReadSeconds").value;
    
    // Set rmUserPrefs.
    rmUserPrefs.minReadMilliseconds = minReadSeconds * 1000;
    
    // Save to storage.
    localStorage.setItem("rmUserPrefs", JSON.stringify(rmUserPrefs));
}