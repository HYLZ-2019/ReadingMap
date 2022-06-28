// This is needed for all SVG drawing.
var SVG_NS = 'http://www.w3.org/2000/svg';

// Useful tool functions used in many places.
// TODO: They don't belong to this file name. Refactor as soon as possible.

/**
 * Parse "rgb(0,255,0)" strings and linear interpolate values between them.
 * @param {string} left: one color
 * @param {string} right: another color 
 * @param {int} total: how many intermediate colors 
 * @returns {Array<string>} total + 1 "rgb(0,255,0)" strings.
 */
function calcMiddleColors(left, right, total){
    // First parse the rgb() strings.
    // TODO: Assert that left & right are strings in format "rgb(0,255,0)".
    let rgbStr = /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i;
    let leftnum = left.match(rgbStr);
    let rightnum = right.match(rgbStr);
    let res = [];
    for (let seq = 0; seq <= total; seq++){
        let calced = [];
        for (let i=1; i<=3; i++){
            // leftnum[1], leftnum[2] and leftnum[3] are RGB respectively (in string).
            // Linear interpolation.
            let ans = parseFloat(leftnum[i]) + (parseFloat(rightnum[i]) - parseFloat(leftnum[i])) * seq / total;
            ans = Math.round(ans);
            calced.push(ans);
        }
        res.push("rgb(" + calced[0] + ", " + calced[1] + ", " + calced[2] + ")");
    }
    return res;
}

/**
 * @param {string} hexstr: The hex string, such as "#00ff00".
 * @returns {string} The rgb string, such as "rgb(0, 255, 0)".
 */
function hexToRgb(hexstr) {
    let hexReg = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    let hex = hexstr.match(hexReg);
    let rgb = [];
    for (let i=1; i<=3; i++){
        rgb.push(parseInt(hex[i], 16));
    }
    return ("rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")");
}

/**
 * @param {string} rgbstr: The rgb string, such as "rgb(0, 255, 0)".
 * @returns {string} The hex string, such as "#00ff00".
 */
 function rgbToHex(rgbstr) {
    let rgbReg = /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i;
    let rgb = rgbstr.match(rgbReg);
    // TODO: data sancheck, such as rgb are all ints.
    hexstr = "#";
    for (let i=1; i<=3; i++){
        // rgb[1], rgb[2] and rgb[3] are RGB respectively (in string).
        let hex = parseInt(rgb[i]).toString(16);
        if (hex.length == 1) {
            hex = "0" + hex;
        }
        hexstr += hex;
    }
    return hexstr;
}


// Definitions of readingMap classes.


// The class storing user preferences. Preferences can be modified in options.html.
class ReadingMapPreferences {
    constructor(obj){
        if (obj == undefined) {
            // The default settings.

            // The user can "read" the page by staying on it for minReadMilliseconds.
            this.minReadMilliseconds = 2 * 1000;

            // Pages read for >= maxReadTimes times are all the same color.
            this.maxReadTimes = 5;

            // Colors to represent different reading times.
            this.barColors = [];
            let zeroColor = "rgb(255,255,255)"; // White
            let maxColor = "rgb(0,255,0)"; // Green
            this.barColors = calcMiddleColors(zeroColor, maxColor, this.maxReadTimes);
        }
        else {
            this.minReadMilliseconds = obj.minReadMilliseconds;
            this.maxReadTimes = obj.maxReadTimes;
            this.barColors = obj.barColors;
        }

    }
    getBarColor(times){
        times = times > this.maxReadTimes? this.maxReadTimes : times;
        return this.barColors[times];
    }
}

class ReadingMapMetadata {
    constructor(){
        // The pdf's title.
        this.title = this.getTitle(window.location.href);

        // The file path.
        this.path = window.location.pathname;

        // How many pages are in this pdf.
        this.pages = window.PDFViewerApplication.pdfViewer.pdfDocument._pdfInfo.numPages;

        // The fingerprint identifier provided by pdf.js.
        this.fingerprint = window.PDFViewerApplication.pdfViewer.pdfDocument._pdfInfo.fingerprint;
    }

    // Used to convert data from old versions.
    oldToString(){
        return JSON.stringify({title:this.title, path:this.path, pages:this.pages,fingerprint:this.fingerprint});
    }

    toString(){
        // TODO: Use a unique & more compact representation!
        // DXR:Ignore title and path
        return JSON.stringify({pages:this.pages,fingerprint:this.fingerprint});
    }

    classIsDataSchema(url) {
        var i = 0,
            ii = url.length;
      
        while (i < ii && url[i].trim() === '') {
          i++;
        }
      
        return url.substring(i, i + 5).toLowerCase() === 'data:';
    }

    classGetPDFFileNameFromURL(url) {
        var defaultFilename = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'document.pdf';
      
        if (typeof url !== 'string') {
          return defaultFilename;
        }
      
        if (this.classIsDataSchema(url)) {
          console.warn('getPDFFileNameFromURL: ' + 'ignoring "data:" URL for performance reasons.');
          return defaultFilename;
        }
      
        var reURI = /^(?:(?:[^:]+:)?\/\/[^\/]+)?([^?#]*)(\?[^#]*)?(#.*)?$/;
        var reFilename = /[^\/?#=]+\.pdf\b(?!.*\.pdf\b)/i;
        var splitURI = reURI.exec(url);
        var suggestedFilename = reFilename.exec(splitURI[1]) || reFilename.exec(splitURI[2]) || reFilename.exec(splitURI[3]);
      
        if (suggestedFilename) {
          suggestedFilename = suggestedFilename[0];
      
          if (suggestedFilename.includes('%')) {
            try {
              suggestedFilename = reFilename.exec(decodeURIComponent(suggestedFilename))[0];
            } catch (ex) {}
          }
        }
      
        return suggestedFilename || defaultFilename;
    }

    getTitle(url) {
        var title = this.classGetPDFFileNameFromURL(url);
    
        if (!title) {
          try {
            title = decodeURIComponent(getFilenameFromUrl(url)) || url;
          } catch (ex) {
            title = url;
          }
        }
        console.log(title);
        return title;
    }
}


// The class for [ All recorded data for a single PDF ].
class ReadingMapRecord {
    constructor(obj) {
        if (obj == undefined) {
            // Grab information from the current page.
            // Metadata about "which pdf this is for".
            this.metadata = pdfMetadata;

            let pages = this.metadata.pages;

            // An array in which readTimes[i-1] is how many times the ith page has been read. 
            this.readTimes = [];
             // An array in which reader took notes[i-1] in the ith page
            this.notes=[];
            // An array which records marks,initial value is false
            this.markers=[]
            // Intialize readTimes/notes/markers
            for (let i=0; i<pages; i++){
                this.readTimes.push(0);
                this.notes.push("")
                this.markers.push(false)
            }

            this.lastTime = [];

            let cur = new Date();

            for (let i=0; i<pages; i++){
                this.lastTime.push(cur);
            }

            this.createTime = cur.toJSON();

        }
        else {
            // TODO: make this more elegant.
            this.metadata = obj.metadata;
            this.pages = obj.pages;
            this.readTimes = obj.readTimes;
            this.lastTime = obj.lastTime;
            this.markers = obj.markers;
            this.notes = obj.notes;
            this.createTime = obj.createTime;
        }
    }
    
    toString(){
        // TODO: Use a more compact representation.
        return JSON.stringify(this);
    }
}


// The class storing <title, how many pages read today>.
class ReadingMapSimpleHistory {
    constructor(){
        // The title of the pdf.
        this.title = "";
        // How many pages newly read today.
        this.pages = 0;
    }
}

// The class storing all ReadingMapSimpleHistory for a single day.
class ReadingMapDayHistory {
    constructor(obj){
        if (obj == undefined) {
            // Date.
            this.date = new Date().toJSON();
            // Array<ReadingMapSimpleHistory>
            this.history = [];
        } else {
            this.date = obj.date;
            this.history = obj.history;
        }
    }
}