// Definitions of readingMap classes.

// The class storing user preferences. Preferences can be modified in options.html.
class ReadingMapPreferences {
    constructor(initstring){
        if (initstring == undefined) {
            // The default settings.

            // The user can "read" the page by staying on it for minReadMilliseconds.
            this.minReadMilliseconds = 2 * 1000;

            // Pages read for >= maxReadTimes times are all the same color.
            this.maxReadTimes = 5;

            // Colors to represent different reading times.
            this.barColors = [];
            for (let i=0; i<=this.maxReadTimes; i++){
                let opacity =  i/this.maxReadTimes;
                let color = "rgba(0, 255, 0, " + opacity + ")";
                this.barColors.push(color);
            }
        }
        else {
            let obj = JSON.parse(initstring);
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
        this.title = document.getElementsByTagName("title")[0].innerText;

        // The file path.
        this.path = window.location.pathname;

        // How many pages are in this pdf.
        this.pages = window.PDFViewerApplication.pdfViewer.pdfDocument._pdfInfo.numPages;

        // The fingerprint identifier provided by pdf.js.
        this.fingerprint = window.PDFViewerApplication.pdfViewer.pdfDocument._pdfInfo.fingerprint;
    }

    toString(){
        // TODO: Use a unique & more compact representation!
        return JSON.stringify(this);
    }
}

// The class for [ All recorded data for a single PDF ].
class ReadingMapRecord {
    constructor(initstring) {
        if (initstring == undefined) {
            // Grab information from the current page.
            // Metadata about "which pdf this is for".
            this.metadata = pdfMetadata;

            let pages = this.metadata.pages;

            // An array in which readTimes[i-1] is how many times the ith page has been read. 
            this.readTimes = [];
            for (let i=0; i<pages; i++){
                this.readTimes.push(0);
            }
        }
        else {
            console.log(initstring);
            // TODO: make this more elegant.
            let obj = JSON.parse(initstring);
            this.metadata = obj.metadata;
            this.pages = obj.pages;
            this.readTimes = obj.readTimes;
        }
    }
    toString(){
        // TODO: Use a more compact representation.
        return JSON.stringify(this);
    }
}