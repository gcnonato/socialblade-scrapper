var fs = require('fs');
var request = require("request"),
    cheerio = require("cheerio"),
    url = "http://socialblade.com/youtube/user/" + process.argv[2];
var completeUrl = url + "/videos/mostviewed";

var replaceAll = function(find, replace, str) {
    var find = find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return str.replace(new RegExp(find, 'g'), replace);
};

var getUsreName = function(url) {
    if (!url) {
        return '';
    }

    var parts = url.split('/');
    return parts[parts.length - 1];
};

var topchannel = {};

topcountry.request = function(url) {
    request(url, function(error, response, body) {
        if (!error) {
            var $ = cheerio.load(body);

            var result = [];

            $('div.RowRecentTable').filter(function(i, el) {
                if ($(this).find("a[href*=youtube]")) {
                    var href = $(this).find("a[href*=youtube]").attr('href');
                    if (!href.split('v=')[1]) {
                        return;
                    }

                    var video = {};
                    var $first = $(this).find('.TableMonthlyStats').first();
                    video.date = $first.text();
                    video.url = $first.next().next().text();
                    video.views = $first.next().next().next().text();
                    video.likes = $first.next().next().next().next().text();
                    video.comments = {};
                    video.comments.count = $first.next().next().next().next().next().find('a').text();
                    video.comments.url = $first.next().next().next().next().next().find('a').attr('href');
                    result.push(video);
                }
            });

            var es = {
                videos: result
            };

            var output = 'top_videos_' + getUserName(url) + '.json';
            fs.writeFile(output, JSON.stringify(es, null, 4), function(err) {
                console.log('File successfully written! - Check your project directory for the ' + output + ' file');
            });

        } else {
            console.log("We’ve encountered an error: " + error);
        }
    });
}

topchannel.request(completeUrl);

exports = module.exports = topchannel;