const simpleGit= require("simple-git")
const fs=require("fs-extra")
const path=require("path")

const cloneRepo=async(repoUrl)=>{
    const repoName= repoUrl.split("/").pop().replace(".git","")
    
    const reposBasePath = path.join(__dirname, "../repos");
    const repoPath = path.join(reposBasePath, repoName);

    await fs.ensureDir(reposBasePath);
    await fs.remove(repoPath);

    const git= simpleGit();
    await git.clone(repoUrl,repoPath,["--depth","1"]);

    return{
        name:repoName,
        path:repoPath
    }

}
module.exports = cloneRepo;