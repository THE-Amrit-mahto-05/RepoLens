const fs= require("fs-extra")
const path= require("path")

const IGNORED_DIRS = [".git","node_modules","dist","build"];

async function readPackageJson(currentDir,rootDir=currentDir){
    const entries= await fs.readdir(currentDir,{withFileTypes:true})
    let result=[]

    for(const entry of entries){
        
    }
    
}