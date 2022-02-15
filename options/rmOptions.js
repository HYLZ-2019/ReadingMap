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
    rmInitColorBar(prefs.maxReadTimes, prefs.barColors[0], prefs.barColors[prefs.maxReadTimes]);
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
        let color = document.getElementById("setColorsSVG").childNodes[i].getAttribute("fill");
        console.log(color);
        rmUserPrefs.barColors.push(color);
    }
    
    // Save to storage.
    localStorage.setItem("rmUserPrefs", JSON.stringify(rmUserPrefs));
}

function rmInitColorBar(colorNum, leftcolor, rightcolor){
    let svg = document.getElementById("setColorsSVG");
    // Clean all previous children.
    while (svg.firstChild){
        svg.removeChild(svg.firstChild);
    }
    // Draw a rectangle for each color.
    for (let i=0; i<=colorNum; i++){
        let rect = document.createElementNS(SVG_NS, "rect");
        rect.setAttribute("class", "colorSettingBarBlock");
        rect.setAttribute("x", 100*i);
        rect.setAttribute("y", 0);
        rect.setAttribute("width", 100);
        rect.setAttribute("height", 100);
        rect.setAttribute("fill", calcMiddleColor(leftcolor, rightcolor, colorNum, i));
        svg.appendChild(rect);
    }
    svg.setAttribute("viewBox", "0 0 " + (colorNum + 1)*100 + " 100");
    svg.setAttribute("preserveAspectRatio", "none");
    document.getElementById("maxColorNumber").innerText = colorNum;
}

calcMiddleColor
function calcMiddleColor(left, right, total, seq){
    // First parse the rgba() strings.
    // TODO: Assert that left & right are strings in format "rgba(0,255,0,0.5)".
    rgbaStr = /^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([+-]?\d+(\.\d+)?)\s*\)$/i;
    leftnum = left.match(rgbaStr);
    rightnum = right.match(rgbaStr);
    calced = [];
    for (let i=1; i<=4; i++){
        // leftnum[1], leftnum[2], leftnum[3] and leftnum[4] are RGBA respectively (in string).
        // Linear interpolation.
        let ans = parseFloat(leftnum[i]) + (parseFloat(rightnum[i]) - parseFloat(leftnum[i])) * seq / total;
        calced.push(ans);
    }
    return ("rgba(" + calced[0] + ", " + calced[1] + ", " + calced[2] + ", " + calced[3] + ")");
}

function rmColorNumOnChange(){
    let newnum = parseInt(document.getElementById("numOfColors").value);
    console.log(newnum);
    // Use the colors in the saved preference.
    rmInitColorBar(newnum, rmUserPrefs.barColors[0], rmUserPrefs.barColors[rmUserPrefs.maxReadTimes]);
}