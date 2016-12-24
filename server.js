var http = require('http');
var uwaterlooApi = require('uwaterloo-api');

var config = require('./config.json');
var uwclient = new uwaterlooApi({
	API_KEY : config.api_key
});

var portTest = 9000;
var port = 8080;
var server = http.createServer(function (req,res){
	res.writeHead(200,{'Content-Type':'text/plain'});
	res.end('Hello world\n');
})
//server.listen(portTest);
server.listen(port, "localhost");

console.log('Listening',port);
uwclient.get('/courses/{course_subject}/{course_number}/schedule',
{
	course_subject : 'CS',
	course_number : '246'
},
function(err,res){
//	console.log(res);
});

uwclient.get('/courses/{course_id}.{format}',
{
	course_id : '007407',
	format : 'json'
},
function(err,res){
	if (res){
		console.log(res['data']['terms_offered']);
		// subjects[nextSub][nextCN]['terms_offered']=res['data']['terms_offered'];
	}
	else{
		// subjects[nextSub][nextCN]['terms_offered']=[];
		console.log("Not Found");
	}
});

var subjects={}

uwclient.get('/courses.{format}',
{
	format : 'json'
},
function(err,res){
	// console.log(res);
	for (var i in res['data']){
		var nextSub=res['data'][i]['subject'];
		var nextCN=res['data'][i]['catalog_number'];
		if (!(nextSub in subjects)){
			subjects[nextSub]={};
		}
		if (!(nextCN in subjects[nextSub])){
			subjects[nextSub][nextCN]={};
		}
		subjects[nextSub][nextCN]['title']=res['data'][i]['title'];
		subjects[nextSub][nextCN]['course_id']=res['data'][i]['course_id'];
	}
	// console.log(subjects);
});

var response = require('./query.js');
