var 
	http = require("http"), 
	sys = require("sys"),
	url = require("url"),
	qs = require("./lib/querystring.node.js/querystring"),
	fs = require("fs");

http.createServer(function(request, response) {
		var urlObj = qs.parse(request.url.replace(/^.*\?/,''));
		var destination = JSON.stringify(urlObj['destination']);
		var api_key = JSON.stringify(urlObj['key']);
		var callTemplate = "Channel: Local/auth\@auth-dialout\nCallerid: hellologin.com <6463280660>\nMaxRetries: 3\nRetryTime: 180\nWaitTime: 30\nContext: auth-dialout\nExtension: auth\nPriority: 2\nSetVar: phone_number=1"+destination+"\nSetVar: api_key="+api_key+"\n\n\n\n";
		if (!destination) {
			response.writeHead(200, { "Content-Type": "text/html" });
	    response.end("<p style='margin-top:16%;font-weight:bold;font-variant:small-caps;color:#000000;letter-spacing:0pt;word-spacing:0pt;font-size:114px;text-align:center;font-family:comic sans, comic sans ms, cursive, verdana, arial, sans-serif;line-height:1;'>hello login</p>");
		} else {
			fs.writeFile("./tmp/spool/outgoing/"+destination+".call", callTemplate, function(err) {
				if (err) throw err;
				// place call
				fs.chmod("./tmp/spool/outgoing/"+destination+".call", 0777);
				fs.rename("./tmp/spool/outgoing/"+destination+".call", "/var/spool/asterisk/outgoing/"+destination+".call", function (err) {
				  if (err) throw err;
				  fs.watchFile("./tmp/spool/responses/1"+destination+".txt", function(curr, prev) {
					fs.readFile("./tmp/spool/responses/1"+destination+".txt", function(err,buffer) {
						if (err) throw err;
						response.writeHead(200, { "Content-Type": "text/plain" });
					  response.end(buffer);
						fs.unwatchFile("./tmp/spool/responses/1"+destination+".txt");
						//fs.unlink("./tmp/spool/responses/1"+destination+".txt", function (err) {
						//  if (err) throw err;
						//    console.log("successfully deleted tmp/spool/responses/1"+destination+".txt");
						//});
						});
					});
					
				});
			});
		}
}).listen(8000);

// console.log('Server running at http://hellologin:8000/');
