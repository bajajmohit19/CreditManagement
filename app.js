const http = require("http");
const chalk = require("chalk");


const server = http.createServer((request, response)=>{
    console.log("***Request is", request.url, "Method is", request.method);
    
    var url = request.url;
    var method = request.method;

    
    if(url == '/' && method == 'GET'){
        serveStaticFile('/index.html',response);
    }else 
    if(isStatic(url)){
        serveStaticFile(url, response);

    }else
    if(url == '/exist' && method == 'POST'){
        response.write("Inside Post");
            let data = '';
            request.on('data',(chunk)=>{
                data = data + chunk;
            })
            request.on('end', ()=>{
                var qs = require('querystring');
                var dataObj = qs.parse(data);
                if(checkUser(dataObj.user)>0){
                    response.write("USER EXIST, GO TO LOGIN PAGE");
                    response.end();
                }else{
                    var newUser = {username:"", name:"", password:""};
                    newUser.username = dataObj.user;
                    newUser.name = dataObj.name ;
                    newUser.password = dataObj.pass;
                    var users = require("./data");
                    users.push(newUser);
                    response.write("NEW USER ADDED TO THE LIST");
                    response.end();
                }
            })
        // response.end();
    }else if(url == '/auth' && method == 'POST'){
        let data = "";
        var dataObj = '';
        request.on('data', (chunk)=>{
            data = data + chunk;
        })
        request.on('end', ()=>{
            var qs = require('querystring');
            dataObj = qs.parse(data);
            var users = require("./data");
            var j = 0;
            for(let i = 0; i<users.length; i++){
                // var name = users[i].name;
                if(users[i].user == dataObj.user){
                    j = i;
                    break;                    
                }
            }

            if(users[j].pass == dataObj.pass){
                console.log(chalk.green("PASSWORD IS OKAY"));
                console.log("Name "+users[j].name);
                response.write("Login Successful, Hey "+ users[j].name +", your credits are " +users[j].credits);
                response.end();
            }else{
                response.write("User Not Exist");
                response.end();
            }
        })
    }
    else{
        response.write("Something Went Wrong");
        response.end();
    }
 
})
server.listen(process.env.port || 12345,(err)=>{
    if(err){
        console.log("Port Busy");
    }
    else{
        console.log("Server start");
    }
})

// ---------------------FUNCTIONAITY-------------------------

function isStatic(url){
    const extensions = ['.html','.js','.css','.jpeg','.jpg','.png',]
    const fs = require('fs');
    const path = require('path');
    const extname = path.extname(url);

    return extensions.indexOf(extname)>=0;
}


function serveStaticFile(url,response){
    const fs = require('fs');
    const path = require('path');

    console.log(chalk.underline.bgBlue("Dirname"), __dirname);

    const fullPath = path.join(__dirname,"public/"+url);

    console.log(chalk.underline.bgBlue("Full PAth"), fullPath);

    fs.readFile(fullPath,(err,content)=>{
        if(err){
            console.log("File not found");
        }
        else{
            response.write(content);
        }
        response.end();
    })
}
function checkUser(user){
    var users = require("./data");
    var check = -1;
    for(let i=0; i<users.length; i++){
        if(user == users[i].user){
                check = i;
                i = users.length;
                break;
            }
    }
    
    console.log("CHECK IS", check);
    return check;
}
