const fs= require("fs-extra");
const path= require("path");
const IGNORED_DIRS = [".git","node_modules","dist","build"];

const EXT_LANG ={
  ".js": "JavaScript",
  ".jsx": "JavaScript",
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".py": "Python",
  ".java": "Java",
  ".c": "C",
  ".cpp": "C++",
  ".rs": "Rust",
  ".go": "Go",
  ".html": "HTML",
  ".css": "CSS",
  ".json": "JSON",
  ".md": "Markdown",
  ".sh": "Shell",
  ".yml": "YAML",
  ".yaml": "YAML",
}
async function scanFiles(currentDir,rootDir=currentDir){
    const entries= await fs.readdir(currentDir,{withFileTypes:true})
    let files= []

    for (const entry of entries){
        const fullPath= path.join(currentDir,entry.name)
        if(entry.isDirectory()){
            if(IGNORED_DIRS.includes(entry.name)){
                continue
            }
            const nestedFiles = await scanFiles(fullPath,rootDir)
            files.push(...nestedFiles)
        }else{
            const ext= path.extname(entry.name).toLowerCase()
            const type= entry.name==="Dockerfile"?"Docker":EXT_LANG[ext] || "Unknown"
            files.push({
            path:path.relative(rootDir,fullPath),
            type,
            })
        }
        
        
    }
    return files;
}
module.exports = scanFiles;