// save the (key, value) into the localStorage
function save(key, value) {
    if (key == "rmMetadataSet") {
        localStorage.setItem(key, JSON.stringify(Array.from(value)));
    } else if (key == "rmUserPrefs") {
        localStorage.setItem(key, JSON.stringify(value));
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
            return [];
        } else {
            return "";
        }
    } else {
        if (key == "rmMetadataSet") {
            return new Set(JSON.parse(value));
        } else if (key == "rmUserPrefs") {
            return new ReadingMapPreferences(JSON.parse(value));
        } else if (key == "rmBooksToday"){
            return new ReadingMapDayHistory(JSON.parse(value));
        } else {
            return new ReadingMapRecord(JSON.parse(value));
        }
    }
}