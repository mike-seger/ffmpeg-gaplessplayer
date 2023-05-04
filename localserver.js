const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const port = parseInt(process.argv[2] || '7801');

http.createServer((req, res) => {
	console.log(`${req.method} ${req.url}`);

	// parse URL
	const parsedUrl = url.parse(req.url);
	// extract URL path
	let pathname = `.${parsedUrl.pathname}`;
	// based on the URL path, extract the file extension. e.g. .js, .doc, ...
	const ext = path.parse(pathname).ext;
	// maps file extension to MIME typere
	const map = {
		'.ico': 'image/x-icon',
		'.html': 'text/html',
		'.js': 'text/javascript',
		'.json': 'application/json',
		'.css': 'text/css',
		'.png': 'image/png',
		'.jpg': 'image/jpeg',
		'.wav': 'audio/wav',
		'.m4a': 'audio/alac',
//		'.m4a': 'audio/mp4',
		'.mp3': 'audio/mpeg',
		'.svg': 'image/svg+xml',
		'.pdf': 'application/pdf',
		'.doc': 'application/msword'
	};

		fs.readFile(__dirname + decodeURI(req.url), (err, data) => {
			if (err) {
				res.writeHead(404, { 'Content-Type': 'text/html' });
				res.end('404: File not found');
			} else {
				res.setHeader("Access-Control-Allow-Origin", "*");
				res.setHeader("Access-Control-Allow-Methods", "GET, POST");
				res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");			
				res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
				res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
				res.setHeader('Content-type', map[ext] || 'text/plain' );
				res.end(data);
			}
		});

}).listen(parseInt(port));

console.log(`Server listening on port ${port}`);
