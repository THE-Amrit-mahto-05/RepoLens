const simpleGit= require("simple-git")
const fs=require("fs-extra")
const path=require("path")

const cloneRepo=async(repoUrl)=>{
    const repoName= repoUrl.split("/").pop().replace(".git","")
    const repoPath= path.join(__dirname,"../repos",repoName)

    await fs.remove(repoPath);

    const git= simpleGit();
    await git.clone(repoUrl,repoPath,["--depth","1"]);

    return{
        name:repoName,
        path:repoPath
    }

}
module.exports = cloneRepo;