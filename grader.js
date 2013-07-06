#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsign.

References:

+ cheerio
- https://github.com/MatthewMueller/cheerio
- http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
- http://maxogden.com/scraping-with-node.html

+ commander.js
- https://github.com/visionmedia/commander.js
- http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

+ JSON
- http://en.wikipedia.org/wiki/JSON
- https://developer.mozilla.org/en-US/docs/JSON
- https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require("restler");
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URLADDRESS_DEFAULT = "http://sleepy-earth-3557.herokuapp.com/";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting", instr);
	process.exit(1);
    }

    return instr;
};

var loadUrlData = function(url, callback) {
    var inurl = url.toString();

    return rest.get(inurl).on('complete', function(result) {
	if (result instanceof Error) {
	    console.log('Error: ' + result.message);
	    process.exit(1);
	} else {
	    try {
		fs.writeFileSync("url.html", result);
		checkJson = checkHtmlFile("url.html", program.checks);
	    } catch (err) {
		console.log ('Error; ');
	    }
	}
    });	       
}

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile){
    $ = cheerioHtmlFile(htmlfile);
    var checks =loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks){
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }

    console.log(JSON.stringify(out, null, 4));
};


/*var getURL = function(url){
    
}*/

var clone = function(inf){
    return inf.bind({});
}

if(require.main == module){
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url_address>', 'Path to Heroku website' , URLADDRESS_DEFAULT) 
	.parse(process.argv);

    var choiceArg = program.rawArgs[4].substr(1,2);
    if(choiceArg == 'f'){
	var checkJson = checkHtmlFile(program.file, program.checks);
    } else{
	loadUrlData(program.url);
    }
} else{
    exports.checkHtmlFile = checkHtmlFile;
}
