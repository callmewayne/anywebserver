const  http = require('http')
const serverConfig = require('./config/config.js')
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const promisify = require('util').promisify

const route = require('./route.js')

const server = http.createServer((req,res)=>{
    const filePath = path.join(serverConfig.root,req.url)
    route(req,res,filePath)
   
})
server.listen(serverConfig.port,serverConfig.hostname,()=>{
let addr = `http://${serverConfig.hostname}:${serverConfig.port}`;
console.log(`Server start at ${chalk.green(addr)}`)
})