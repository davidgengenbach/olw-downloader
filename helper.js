var q = require('q'),
    config = require('./config.js'),
    R = require('ramda');

function concat(a, b) {
    return a + b;
}

concat = R.curry(concat);

function splitUUID(uuid) {
    return uuid.split('-').join('').match(/.{2}/g).join('/');
}

module.exports = {
    concat: concat,
    getCollectionIndexFromUrl: function(url) {
        return url.substring(url.lastIndexOf("-") + 1);
    },
    getCollectionUrlFromIndex: function(index) {
        return config.COLLECTION_API_URL + index;
    },
    getVideoUrlFromId: function(id) {
        return config.VIDEO_API_URL + id;
    },
    splitUUID: splitUUID,
    getVideoDownloadURLFromUUID: R.compose(concat(config.VIDEO_DOWNLOAD_URL), splitUUID),
    sanitizeFileName: function(name, toLower) {
        var f = name.replace(/ /g, '_').replace('/\./g', '_');
        return toLower ? f.toLowerCase() : f;
    },
    getVideoFilename: function(prefix, videoIndex, videoName) {
        return config.DOWNLOAD_FOLDER + prefix + '/' + videoIndex + "_" + this.sanitizeFileName(videoName) + config.VIDEO_EXTENSION;
    },
    logCollectionData: function(data) {
        console.log("Name:", data.name);
        console.log("Desc:", data.description);
    }
}