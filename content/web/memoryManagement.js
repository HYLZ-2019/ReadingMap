// save the (key, value) into the localStorage
function save(key, value) {
    if (key == "rmMetadataSet") {
        localStorage.setItem(key, JSON.stringify(Array.from(value)));
    } else if (key == "rmUserPrefs") {
        localStorage.setItem(key, JSON.stringify(value));
    } else if (key == "rmBooksToday"){
        localStorage.setItem(key, JSON.stringify(value));
    } else if (key == "rmHistorySet") {
        localStorage.setItem(key, JSON.stringify(Array.from(value)));
    } else {
        localStorage.setItem(key, value.toString());
    }
}

// load the value with key in the localStorage
function load(key) {
    let value = localStorage.getItem(key);
    if (value == null || value == "") {
        // Initialize objects.
        if (key == "rmMetadataSet") {
            value = new Set();
            localStorage.setItem(key, JSON.stringify(Array.from(value)));
            return value;
        } else if (key == "rmUserPrefs") {
            value = new ReadingMapPreferences();
            localStorage.setItem(key, JSON.stringify(value));
            return value;
        } else if (key == "rmBooksToday"){
            return new ReadingMapDayHistory();
        } else if (key == "rmHistorySet") {
            value = new Set();
            localStorage.setItem(key, JSON.stringify(Array.from(value)));
            return value;
        } else {
            return "";
        }
    } else {
        if (key == "rmMetadataSet") {
            return new Set(JSON.parse(value));
        } else if (key == "rmUserPrefs") {
            return new ReadingMapPreferences(JSON.parse(value));
        } else if (key == "rmBooksToday") {
            return curDayHistory(new ReadingMapDayHistory(JSON.parse(value)));
        } else if (key == "rmHistorySet") {
            return new Set(JSON.parse(value));
        } else {
            return new ReadingMapRecord(JSON.parse(value));
        }
    }
}

function curDayHistory(today) {
    let cur = new Date();
    let lastTime = new Date(today.date);
    console.log(lastTime);
    console.log(cur);
    if (lastTime.toDateString() != cur.toDateString()) {
        let rmHistorySet = load("rmHistorySet");
        rmHistorySet.add(today);
        save("rmHistorySet", rmHistorySet);
        // console.log(rmHistorySet);
        today = new ReadingMapDayHistory();
    } 
    save("rmBooksToday", today);
    return today;
}

function getReadingMap() {
    let cur = JSON.stringify(localStorage);
    // for (var i = 0; i < localStorage.length; i++) {
    //     cur = cur + "{" + encodeURIComponent(localStorage.key(i)) + ":"
    //          + encodeURIComponent(localStorage.getItem(localStorage.key(i))) + "}\n";       
    // }
    return cur; 
}