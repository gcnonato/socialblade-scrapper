var fs = require('fs');
var request = require("request"),
requestSync = require("sync-request"),
sleep = require("sleep"),
    _url = "http://socialblade.com/youtube/user/",
    _url2 = "/videos/mostviewed";

var topchannel = function() {};

topchannel.prototype.request = function(dir, userName, youtubeApiKey) {
    var url = _url + userName + _url2;
    console.log(url);
    var self = this;

    var channelID = 'https://www.googleapis.com/youtube/v3/channels?key=' + youtubeApiKey + '&forUsername=' + userName + '&part=id';
    request(channelID, function(error, response, body) {
        try {
            if (error) {
                console.log("We’ve encountered an error: " + error);
                return;
            }

            var options = {
                'url': 'http://socialblade.com/js/jquery/class/youtube-video-mostviewed',
                formData: {
                    channelid: JSON.parse(body).items[0].id
                },
                headers: {
                    Accept: '*/*',
                    // 'Accept-Encoding': 'gzip, deflate',
                    'Accept-Language': 'es-ES,es;q=0.8,en;q=0.6',
                    'Cache-Control': 'max-age=0',
                    Connection: 'keep-alive',
                    'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    // Cookie: '__cfduid=de283e9760fa69be3d4bb275587c6558a1434792197; PHPSESSID=idt85kte8eu009t5mjlpnga653; _cb_ls=1; __qca=P0-578643269-1434793441604; __utmt=1; _gat=1; __utma=246983814.1308758344.1434792199.1434832150.1434880142.4; __utmb=246983814.15.10.1434880142; __utmc=246983814; __utmz=246983814.1434792199.1.1.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); _ga=GA1.2.1308758344.1434792199; _chartbeat2=IOElcUz25FCAOelt.1434792201417.1434882866365.11; _chartbeat4=t=D5C902BqiL3TC6g2WWClsHIZcHPtg&E=0&x=0&c=3.99&y=2893&w=1258; __asc=ea931c9e14e15856c78c06d84b5; __auc=cf922c0b14e1047839027d567a4',
                    Host: 'socialblade.com',
                    Origin: 'http://socialblade.com',
                    Referer: url,
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.52 Safari/537.36',
                    "X-Requested-With": 'XMLHttpRequest'
                }
            };

            request.post(options, function(error, response, body) {
                if (!error) {
                    var es = self.downloadSnippet(JSON.parse(body), youtubeApiKey);
                    var output = 'top_videos_' + userName + '.json';
                    var fn = dir + '/' + output;
                    fs.writeFileSync(fn, JSON.stringify(es, null, 4), function(err) {
                        console.log('File successfully written! - Check your project directory for the ' + output + ' file');
                        fs.close(fn);
                    });
                    fs.close(fn);
                } else {
                    console.log("We’ve encountered an error: " + error);
                }
            });
        } catch (ignore) {
            console.log('Error getting videos');
            console.log(ignore);
        }
    });
};

topchannel.prototype.downloadSnippet = function(result, youtubeApiKey) {
    var video, videoId, snippet;
    var completeResult = [];
    for (var i = 0, l = result.length; i<l; i++) {
        try {
            video = result[i];
            videoId = video.videoId;
            if (videoId) {
                sleep.sleep(2);
                snippet = this.downloadFromYT(videoId, youtubeApiKey);
                // console.log(snippet);
                if (snippet.items && snippet.items.length && videoId == snippet.items[0].id.videoId) {
                    video.snippet = snippet.items[0].snippet;
                    completeResult.push(video);
                } else {
                    console.log('video not found on Youtube');
                }
            }
        } catch (ignore) {
            console.log('error on downloadSnippet');
            console.log(ignore);
        }
    }

    var es = {
        videos: completeResult
    };

    return es;
};

function prepareId(videoId) {
    if (!videoId) {
        return '';
    }

    if (videoId.indexOf('-') == 0) {
        videoId = videoId.substring(1, videoId.length - 1);
    }

    return videoId;
};

topchannel.prototype.downloadFromYT = function(videoId, youtubeApiKey) {
    videoId = prepareId(videoId);
    var url = 'https://www.googleapis.com/youtube/v3/search?part=id%2Csnippet&q=' + videoId + '&maxResults=1&key=' + youtubeApiKey;
    console.log(url);
    var res = requestSync('GET', url);
    return JSON.parse(res.getBody());
};

exports = module.exports = topchannel;