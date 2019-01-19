const fs = require('fs')
const promisify = require('util').promisify
const stat = promisify(fs.stat)
const readdir = promisify(fs.readdir)
const serverConfig = require('./config/config.js')
const path = require('path')
const Handlebars = require('handlebars') //处理html模板
const tplPath = path.join(__dirname, './template/dir.tpl')
const source = fs.readFileSync(tplPath, 'utf-8')
const template = Handlebars.compile(source)
const mimeType = require('./helper/mime')
const compress = require('./helper/compress')
const range = require('./helper/range')
module.exports = async function (req, res, filePath) {
    try {
        const stats = await stat(filePath)
        if (stats.isFile()) {
            const contentType = mimeType(filePath)
            res.statusCode = 200
            res.setHeader('Content-Type', contentType)
            let rs
            rs = fs.createReadStream(filePath)
            // const {
            //     code,
            //     start,
            //     end
            // } = range(stats.size, req, res)
            // if (code == 200) {
            //     rs = fs.createReadStream(filePath)
            // } else {
            //     rs = fs.createReadStream(filePath, {
            //         start,
            //         end
            //     })
            // }
            // res.writeHead(200, {
            //     'Content-Type': 'application/force-download',
            //     'Content-Disposition': `attachment; filename=${path.filename(filePath)}`
            //   });
            if (filePath.match(serverConfig.compress.source)) {
                rs = compress(rs, req, res)
            }
            rs.pipe(res)

        } else if (stats.isDirectory()) {
            const files = await readdir(filePath)
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html')
            const dir = path.relative(serverConfig.root, filePath)
            const data = {
                title: path.basename(filePath),
                dir: dir ? `/${dir}` : '',
                files: files.map(file => {
                    return {
                        file,
                        icon: mimeType(file)
                    }
                })
            }
            res.end(template(data))
        }
    } catch (error) {
        res.statusCode = 404
        console.log(error)
        res.setHeader('Content-Type', 'text/plain')
        res.end(`${filePath} is not a directory or file`)
    }
}