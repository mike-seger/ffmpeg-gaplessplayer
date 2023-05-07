const http = require('http');
const fs = require('fs');
const port = parseInt(process.argv[2] || '7801');

http.createServer((req, res) => {
	try {	
		let uri = __dirname + decodeURI(req.url)
		const isDir = uri.replace(/.*\//, "").indexOf(".")<0
		if(isDir && !uri.endsWith("/")) {
			console.log("redirect: "+req.url + "/")
			res.writeHead(302, {'Location': req.url + "/" })
			res.end()
		} else {
			let stat = fs.statSync(uri)
			console.log(`${req.method} ${req.url}`);
			if (stat.isDirectory() && uri.endsWith("/")) {
				console.log("is index")
				uri += "index.html"
				stat = fs.statSync(uri)
			}

			if(stat.isDirectory() && !uri.endsWith("/")) {
				response.writeHead(302, {'Location': req.url + "/" })
				response.end()
			} else {
				const ext = uri.replace(/.*(\.[^.]*)$/, "$1")
				const map = {
					'.ico': 'image/x-icon',
					'.html': 'text/html',
					'.js': 'text/javascript',
					'.json': 'application/json',
					'.css': 'text/css',
					'.png': 'image/png',
					'.jpg': 'image/jpeg',
					'.wav': 'audio/wav',
					'.m4a': 'audio/mp4',
					'.mp3': 'audio/mpeg',
					'.svg': 'image/svg+xml',
					'.pdf': 'application/pdf',
					'.doc': 'application/msword'
				}
			
				fs.readFile(uri, (err, data) => {
					if (err) {
						res.writeHead(404, { 'Content-Type': 'text/html' })
						res.end('500: Internal server error: '+err)
					} else {
						res.setHeader("Access-Control-Allow-Origin", "*")
						res.setHeader("Access-Control-Allow-Methods", "GET, POST")
						res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Requested-With")		
						res.setHeader("Cross-Origin-Embedder-Policy", "require-corp")
						res.setHeader("Cross-Origin-Opener-Policy", "same-origin")
						res.setHeader('Content-type', map[ext] || 'text/plain' )
						res.end(data)
					}
				})
			}
		}
	}
	catch(err) {
		console.log(`404: ${req.method} ${req.url}`)
		res.writeHead(404, { 'Content-Type': 'text/html' })
		res.end('404: Resource not found')
	}

}).listen(parseInt(port))

console.log(`Server listening on port ${port}`)
