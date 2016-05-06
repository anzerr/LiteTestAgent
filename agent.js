
var http = require('http');
		
var $ = {
	defined: function(a) {
		return (a !== null && typeof(a) !== 'undefined');
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
	this._sleep = (1000 * 2); 
	this._thread = [];
	this._current = 0;
	this._weight = 0;
	this._lastDump = 0;
	
	this._opt = [
		{
			url: '/message/',
			method: 'GET',
			weight: 5,
			data: function() {
				
				return ({});
			}
		},
		{
			url: '/message/',
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
			url: function() {
				var get = function(thread, path) {
					
					if (thread.length == 0) {
						return (path);
					}
					
					var id = Math.floor(Math.random() * thread.length), current = thread[id];
					if (current.child && current.child.length < 0 && Math.floor(Math.random() * 2) == 1) {
						return (get(current.child, path + ((path == '') ? '' : '.') + (current._id || id)));
					}
					return (path + ((path == '') ? '' : '.') + (current._id || id));
				}
				var url = '/message/' + get(self._thread, '') + '/reply';
				console.log(url);
				return (url);
			},
			method: 'PUT',
			weight: 20,
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

		var post_req = http.request({
			host: '172.16.14.194',
			port: '80',
			path: '/api' + url,
			method: method,
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(_json)
			}
		}, function(res) {
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

		post_req.write(_json);
		post_req.end();
	},
	
	run: function() {
		var self = this;
		
		console.log(this._opt.length, this._current);
		if (!$.defined(this._opt[this._current])) {
			this._current = 0;
			this._weight = 0;
			setTimeout(function() {
				self.run();
			}, this._sleep);
			return (true);
		}
	
		var id = this._current, opt = this._opt[this._current];
		console.log(opt, this._current);
		this.request((typeof(opt.url) == 'function') ? opt.url() : opt.url, opt.method, opt.data(), function(data) {
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
			
			console.log(self._weight, opt.weight);
			self._weight += 1;
			if (self._weight > opt.weight) {
				self._weight = 0;
				self._current += 1;
			}
			
			self.run();
		});
	}
}

module.exports = obj;