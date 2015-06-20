var fs = require('fs');
var request = require("request"),
    cheerio = require("cheerio"),
    url = process.argv[2] || "http://socialblade.com/youtube/top/country/ES";

var replaceAll = function(find, replace, str) {
    var find = find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return str.replace(new RegExp(find, 'g'), replace);
};

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

        fs.writeFile('output.json', JSON.stringify(es, null, 4), function(err) {
            console.log('File successfully written! - Check your project directory for the output.json file');
        });

    } else {
        console.log("We’ve encountered an error: " + error);
    }
});