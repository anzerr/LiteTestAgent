
var cluster = require('cluster');

if (cluster.isMaster) {
	for (var i = 0; i < 4; i++) {
		cluster.fork();
	}
} else {
	var agent = require('./agent.js');

	var t = new agent();
	t.run();
}