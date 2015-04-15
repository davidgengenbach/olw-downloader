var config = require('./config.js'),
    helper = require('./helper.js');

var Q = require('q'),
    rp = require('request-promise'),
    fs = require('fs'),
    R = require('ramda');

var OLW_LINK;

if(process.argv[2]) {
    OLW_LINK = process.argv[2];
} else {
    console.error('Please specify a url like: node download-videos.js \'COLLECTION_URL\'\n (don\'t forget the "\'")');
    process.exit(0);
}

// Temp variables...
var VIDEO_DATA,
    COLLECTION_NAME,
    COLLECTION_DATA;

Q(OLW_LINK)
    // Get the index (the last number in the OLW_LINK)
    .then(helper.getCollectionIndexFromUrl)
    // Add this index to the API url
    .then(helper.getCollectionUrlFromIndex)
    // Download the json with all the collection data
    .then(rp)
    // ... parse it
    .then(JSON.parse)
    // Log the name and description
    .tap(helper.logCollectionData)
    // Save collection data for later use
    .tap(function(data) {
        COLLECTION_DATA = data;
        COLLECTION_NAME = helper.sanitizeFileName(COLLECTION_DATA.name);
    })
    // Save the collection data for later use? as json
    .tap(function(data) {
        var filename = config.DOWNLOAD_FOLDER + COLLECTION_NAME + '/' + helper.sanitizeFileName(data.name) + '.json',
            data = JSON.stringify(data, null, "\t");

        fs.writeFileSync(filename, data);
    })
    .then(function(data) {
        return R.mapIndexed(function(item, index) {
            var videoData = data.resources[item];
            videoData.index = index + 1;
            return videoData;
        }, data.collectionElements);
    })
    // Save video data for later use
    .tap(function(data) {
        VIDEO_DATA = data;
    })
    .then(R.pluck('id'))
    .then(R.map(helper.getVideoUrlFromId))
    .then(R.map(rp))
    .all()
    .then(R.map(JSON.parse))
    .then(R.map(function(videoData) {
        videoData.videoURL = helper.getVideoDownloadURLFromUUID(videoData.uuid);
        return videoData;
    }))
    // Prepare the folder the files should be downloaded to
    .tap(function() {
        try {
            fs.mkdirSync(config.DOWNLOAD_FOLDER + COLLECTION_NAME);
        } catch (e) {
            if (e.code != 'EEXIST') throw e;
        }
    })
    .then(R.mapIndexed(function(videoData, index) {
        var url = videoData.videoURL + '/1.mp4',
            filename = helper.getVideoFilename(COLLECTION_NAME, index, videoData.name);

        videoData.downloadURL = url;
        videoData.downloadFilename = filename;
        return videoData;
    }))
    .invoke('slice', 0, 2)
    .then(R.map(function(videoData) {
        if (fs.existsSync(videoData.downloadFilename)) {
            console.log("--> already downloaded:", videoData.name, videoData.downloadFilename)
            return;
        }

        return rp(videoData.downloadURL, function(result) {
                console.log("--> finished downloading:", videoData.name)
            })
            .pipe(
                fs.createWriteStream(videoData.downloadFilename)
            );
    }))
    .all()
    .catch(console.error)
    .done();
