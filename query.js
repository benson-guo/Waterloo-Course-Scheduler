var methods = {};

methods.getOfferings = function(uwclient,id,callback) {
	uwclient.get('/courses/{course_id}.{format}',
	{
		course_id : id,
		format : 'json'
	},
	function(err,res){
		callback(res['data']['terms_offered']);
	});
};

exports.data = methods