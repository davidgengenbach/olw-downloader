# askdljapsödkljalshjdliwuz1h2lejn12pwq9fadsipn
Usage:
* clone repo
* npm install
* node download-videos.js [OLW_VIDEO_URL]

where [OLW_VIDEO_URL] has to be something like "https://openlearnware.tu-darmstadt.de/#!/collection/mathematik-ii-fur-informatik-und-wirtschaftsinformatik-3"

# TODOs
* Sometimes videos aren't available in the "standard" quality... there should be a fallback mechanism (check for available quality)
* Currently it downloads all the videos concurrently - which is sometimes not desired. should donwload them in batch by defined chunks
* 'Frontend' should be maybe seperated from 'Backend' (Seperation of Concerns): currently one file does all the downloading, parsing, etc.

# Flow
* Gets a OLW link to a collection (a collection is something as https://openlearnware.tu-darmstadt.de/#!/collection/mathematik-ii-fur-informatik-und-wirtschaftsinformatik-3)
* Gets the collection id from this URL (the last number in the URL - in the above case: 3)
* Gets the collection data as JSON from: "https://openlearnware.tu-darmstadt.de/olw-rest-db/api/collection-detailview/index/" + collection id
* This collection data contains all video ids and so on (example: https://openlearnware.tu-darmstadt.de/olw-rest-db/api/collection-detailview/index/3)
* At the next step it gets the UUIDs by getting the video data as JSON from the URL: "https://openlearnware.tu-darmstadt.de/olw-rest-db/api/resource-detailview/index/" + videoid from collection data
* Like: https://openlearnware.tu-darmstadt.de/olw-rest-db/api/resource-detailview/index/3
* There is a field named: uuid
* The video urls: "https://olw-material.hrz.tu-darmstadt.de/olw-konv-repository/material/" + uuid splitted after each 2 chars + "/1.mp4" (1.mp4 stands for "highest" quality as far as I know)
* Now just download the video