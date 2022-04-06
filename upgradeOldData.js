function upgradeAllOldData(){
    // Clean old version keys.
    for (i=0; i<localStorage.length; i++){
        key = localStorage.key(i);
        console.log(key);
        try {
            obj = JSON.parse(key);
            if (obj.pages != undefined && obj.fingerprint != undefined){
                if (obj.title != undefined){
                    pdfRecord = localStorage[key];
                    let newkey = JSON.stringify({pages:obj.pages, fingerprint:obj.fingerprint});
                    localStorage[newkey] = pdfRecord;
                    localStorage.removeItem(key);
                    // Update rmMetadataSet
                    let metaset = load("rmMetadataSet");
                    metaset.push(newkey);
                    metaset.splice(metaset.indexOf(key), 1); // Remove the previous item
                    save("rmMetadataSet", metaset);
                }
            }
        }
        catch (error){
            console.log(error);
        }
    }

    // Clean old version records without certain fields.
    for (i=0; i<localStorage.length; i++){
        key = localStorage.key(i);
        console.log(key);
        try {
            obj = JSON.parse(key);
            if (obj.pages != undefined && obj.fingerprint != undefined){
                record = load(key);
                if (record.lastTime == undefined){
                    record.lastTime = [];
                    for (let j=0; j<obj.pages; j++){
                        record.lastTime.push(new Date());
                    }
                }
                if (record.notes == undefined){
                    record.notes = [];
                    for (let j=0; j<obj.pages; j++){
                        record.notes.push("");
                    }
                }
                if (record.markers == undefined){
                    record.markers = [];
                    for (let j=0; j<obj.pages; j++){
                        record.markers.push(false);
                    }
                }
                if (typeof(record.markers[0])!="boolean"){
                    // markers[0] is a list of objects, as in older versions
                    for (let j=0; j<obj.pages; j++){
                        record.markers[j] = (record.markers[j] == true);
                    }
                }
                if (record.createTime == undefined){
                    record.createTime = new Date().toJSON();
                    for (let j=0; j<obj.pages; j++){
                        if (record.lastTime[j] < record.createTime){
                            record.createTime = record.lastTime[j];
                        }
                    }
                }
                save(key, record);
            }
        }
        catch (error){
            console.log(error);
        }
    }
}