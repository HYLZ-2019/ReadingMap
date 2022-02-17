var rmUserPrefs = rmLoadUserPrefs();
rmBindOptionEvents();
rmShowPreferences(rmUserPrefs);

function rmBindOptionEvents(){
    document.getElementById("rmSaveButton").addEventListener("click", rmSaveAllOptions);
    document.getElementById("numOfColors").addEventListener("change",rmColorNumOnChange);
}

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
    document.getElementById("minReadSeconds").value = prefs.minReadMilliseconds / 1000;
    document.getElementById("numOfColors").value = prefs.maxReadTimes;
    rmInitColorBar(prefs.maxReadTimes, prefs.barColors);
}

function rmSaveAllOptions(){
    // Get data from options page & set rmUserPrefs.
    
    // minReadSeconds.
    minReadSeconds = document.getElementById("minReadSeconds").value;
    rmUserPrefs.minReadMilliseconds = minReadSeconds * 1000;

    // Set colors.
    rmUserPrefs.maxReadTimes = parseInt(document.getElementById("numOfColors").value);
    rmUserPrefs.barColors = [];
    for (let i=0; i<=rmUserPrefs.maxReadTimes; i++){
        // The selector is in a wrapper.
        let color = document.getElementById("setColorsSelectorBox").childNodes[i].firstChild.value;
        color = hexToRgb(color);
        console.log(color);
        rmUserPrefs.barColors.push(color);
    }
    
    // Save to storage.
    localStorage.setItem("rmUserPrefs", JSON.stringify(rmUserPrefs));
}


/**
 * @param {int} colorNum: Draw a bar with colorNum + 1 color selectors.
 * @param {Array<string>} colorArray: Array of colorNum + 1 "rgb(0,255,0)" strings.
 * @returns
 */
function rmInitColorBar(colorNum, colorArray){
    let box = document.getElementById("setColorsSelectorBox");
    // Clean all previous children.
    while (box.firstChild){
        box.removeChild(box.firstChild);
    }
    // Add a color selector for each color.
    for (let i=0; i<=colorNum; i++){
        let sel = document.createElement("input");
        sel.setAttribute("type", "color");
        sel.setAttribute("class", "colorSettingBarBlock");
        sel.value = rgbToHex(colorArray[i]);

        // Hide the annoying "background" area by using a workaround: put each selector in a wrapper, set the selector as invisible, and color the wrapper.
        let wrap = document.createElement("div");
        wrap.setAttribute("class", "colorSettingBarBlockWrapper");
        wrap.style.backgroundColor = sel.value;
        wrap.style.width = String(100/(colorNum+1)) + "%";

        box.appendChild(wrap);
        wrap.appendChild(sel);

        sel.addEventListener("change", function(){
            this.parentNode.style.backgroundColor = this.value;
        })

    }
    document.getElementById("maxColorNumber").innerText = colorNum;
}




function rmColorNumOnChange(){
    let newnum = parseInt(document.getElementById("numOfColors").value);
    // Interpolate between first color and last color.
    let box = document.getElementById("setColorsSelectorBox");
    let leftcolor = hexToRgb(box.firstChild.firstChild.value);
    let rightcolor = hexToRgb(box.lastChild.firstChild.value);
    let colors = calcMiddleColors(leftcolor, rightcolor, newnum);
    rmInitColorBar(newnum, colors);
}