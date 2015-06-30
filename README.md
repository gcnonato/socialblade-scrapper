# socialblade-scrapper

Scraps the socialblade top channels per country page and returns a JSON file. Then uses socialblade and Youtube Data API to get the top 100 videos of each channel and their metadata.

Usage:

`cd topcountry` <br>
`npm install`<br>
`node socialblade-topcountry.js COUNTRY_CODE YOUTUBE_APIKEY true`

See <b>topcountry/top_channels_ES.json</b> for an example.

You'll probably need to set ulimit to a higher value, if an error like this happens:

`{ [Error: spawn EMFILE] code: 'EMFILE', errno: 'EMFILE', syscall: 'spawn' }`

try this:

`ulimit -n 1000`

Credits for http://socialblade.com
