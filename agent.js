
var http = require('http');
		
var $ = {
	defined: function(a) {
		return (a != null && typeof(a) == 'undefined');
	},
	randomKey: function(length, charList) {
        var text = '', possible = charList || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return (text);
    },
}

var obj = function(name) {
	var self = this;
	
	this._name = name;
	this._thread = [];
	this._current = 0;
	this._weight = 0;
	this._lastDump = 0;
	
	this._opt = [
		{
			url: '/message/',
			method: 'GET',
			weight: 1,
			data: function() {
				
				return ({});
			}
		},
		{
			url: '/message/',
			method: 'PUT',
			weight: 5,
			data: function() {
				return ({
					name: self._name,
					content: $.randomKey(128)
				});
			}
		},
		{
			url: function() {
				var get = function(thread, path) {
					
					
				}
				
				return ('/message/' + get(self._thread, '') + '/reply');
			},
			method: 'PUT',
			weight: 10,
			data: function() {
				return ({
					name: self._name,
					content: $.randomKey(128)
				});
			}
		},
		{
			url: '/message/thread/dump',
			method: 'POST',
			weight: 1,
			data: function() {
				return ({
					updatedDate: self._lastDump
				});
			}
		},
	];
};
obj.prototype = {
	request: function(url, method, data, callback) {	
		var _json = JSON.stringify(data);

		var post_options = {
			host: '192.168.53.8',
			port: '80',
			path: '/api' + url,
			method: method,
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(_json)
			}
		};

		// Set up the request
		var post_req = http.request(post_options, function(res) {
			var body = '';
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				body += chunk;
			});
			res.on('end', function() {
				callback(body);
			});
			res.on('error', function(error) {
				console.log(error);
				callback('');
			});
		});

		post_req.write(post_data);
		post_req.end();
	},
	
	run: function() {
		var self = this;
		
		if ($.defined(this._opt[this._current])) {
			this._current = 0;
			this._weight = 0;
		}
	
		var id = this._current, opt = this._opt[this._current];
		callback((typeof(opt.url) == 'function') ? opt.url() : opt.url, opt.method, opt.data(), function(data) {
			if (opt.url == '/message/' && opt.method == 'GET') {
				try {
					self._thread = JSON.parse(data);
				} catch(e) {
					console.log(e);
				}
			}
			
			if (opt.url == '/message/thread/dump') {
				self._lastDump = new Date().getTime();
			}
			
			self._weight += 1;
			if (self._weight < opt.weight) {
				self._weight = 0;
				self._current += 1;
			}
			
			self._run();
		});
	}
}