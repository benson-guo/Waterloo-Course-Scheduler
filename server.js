var http = require('http');
var uwaterlooApi = require('uwaterloo-api');

var config = require('./config.json');
var uwclient = new uwaterlooApi({
	API_KEY : config.api_key
});

var port = 9000;
http.createServer(function (req,res){
	res.writeHead(200,{'Content-Type':'text/plain'});
	res.end('Hello world\n');
}).listen(port);

console.log('Listening',port);
uwclient.get('/courses/{course_subject}/{course_number}/schedule', 
{
	course_subject : 'CS',
	course_number : '246'
},
function(err,res){
	console.log(res);
});
