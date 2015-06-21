var fs = require('fs');
var request = require("request"),
    cheerio = require("cheerio"),
    download = process.argv[4],
    topchannel = require("../topchannel/socialblade-topchannel.js"),
    url = ('http://socialblade.com/youtube/top/country/' + process.argv[2]) || "http://socialblade.com/youtube/top/country/ES";

var API_KEY = process.argv[3];//'AIzaSyDCgdFhkaVNUurakbvgB8ALL8nP0KFcbqk';

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
                        result.push(ch);
                    }
                }
            });

            var es = {
                channels: result
            };

            var output = 'top_channels_' + getCountryCode(url) + '.json';
            fs.writeFile(output, JSON.stringify(es, null, 4), function(err) {
                console.log('File successfully written! - Check your project directory for the ' + output + ' file');
            });

            if (download) {
                var t = new topcountry();
                t.download(result);
            }
        } else {
            console.log("We’ve encountered an error: " + error);
        }
    });
};

topcountry.prototype.download = function(result) {
    console.log(result.length);
    setTimeout(function() {
        if (result.length) {
            var t = new topchannel();
            t.request(result[0].usr, API_KEY, function() {
                result.shift();
                var tt = new topcountry();
                tt.download(result);
            });
        } else {
            console.log('DONE');
        }
    }, 5000);
};

var ttt = new topcountry();
ttt.request(url);

exports = module.exports = topcountry;