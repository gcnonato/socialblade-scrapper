var fs = require('fs');
var request = require("request"),
    syncRequest = require("sync-request"),
    cheerio = require("cheerio"),
    sleep = require("sleep"),
    download = process.argv[4],
    topchannel = require("../topchannel/socialblade-topchannel.js"),
    url = ('http://socialblade.com/youtube/top/country/' + process.argv[2]) || "http://socialblade.com/youtube/top/country/ES";

var API_KEY = process.argv[3]; //'AIzaSyDCgdFhkaVNUurakbvgB8ALL8nP0KFcbqk';

var replaceAll = function(find, replace, str) {
    var find = find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return str.replace(new RegExp(find, 'g'), replace);
};

var getCountryCode = function(url) {
    if (!url) {
        return '';
    }

    var parts = url.split('/');
    return parts[parts.length - 1];
};

var topcountry = function() {};

topcountry.prototype.request = function(url) {
    var self = this;
    request(url, function(error, response, body) {
        if (!error) {
            var $ = cheerio.load(body);

            var result = [];

            $('div.TableMonthlyStats').filter(function(i, el) {
                if ($(this).find("a[href*=youtube]")) {
                    var text = $(this).find("a[href*=youtube]").text();
                    if (text) {
                        var ch = {};
                        ch.usr = text;
                        ch.channel = 'http://' + $(this).find("a[href*=youtube]").attr('href');
                        ch.subs = replaceAll(',', '', $(this).next('div').find('span').text());
                        ch.views = replaceAll(',', '', $(this).next('div').next('div').find('span').text());

                        try {
                            sleep.sleep(5);
                            var channelInfo = self.downloadChannelInfo(text, API_KEY);
                            ch.channelInfo = channelInfo;
                        } catch (ignore) {
                            console.log(ignore);
                        }

                        result.push(ch);
                    }
                }
            });

            var es = {
                channels: result
            };

            var countryCode = getCountryCode(url);
            var output = 'top_channels_' + countryCode + '.json';

            if (!fs.existsSync(countryCode)) {
                fs.mkdirSync(countryCode);
            }

            fs.writeFile(output, JSON.stringify(es, null, 4), function(err) {
                console.log('File successfully written! - Check your project directory for the ' + output + ' file');
            });

            if (download) {
                var t = new topcountry();
                t.download(countryCode, result);
            }
        } else {
            console.log("We’ve encountered an error: " + error);
        }
    });
};

topcountry.prototype.downloadChannelInfo = function(channelName, youtubeApiKey) {
    console.log('downloading channel info: ' + channelName);
    var urlID = 'https://www.googleapis.com/youtube/v3/channels?key=' + youtubeApiKey + '&forUsername=' + channelName + '&part=id';
    var res = syncRequest('GET', urlID);

    var channelId = JSON.parse(res.getBody()).items[0].id;

    var urlComplete = 'https://www.googleapis.com/youtube/v3/channels?key=' + youtubeApiKey + '&id=' + channelId + '&part=id,snippet,brandingSettings,contentDetails,invideoPromotion,statistics,topicDetails';
    res = syncRequest('GET', urlComplete);

    return JSON.parse(res.getBody()).items[0];
};

topcountry.prototype.download = function(folder, result) {
    console.log(result.length);
    setTimeout(function() {
        if (result.length) {
            var t = new topchannel();
            t.request(folder, result[0].usr, API_KEY);
            result.shift();
            var tt = new topcountry();
            tt.download(folder, result);
        } else {
            console.log('DONE');
            process.exit(1);
        }
    }, 5000);
};

var ttt = new topcountry();
ttt.request(url);

exports = module.exports = topcountry;