const fastify= require("fastify")();
const fs=require("fs-extra");
const cloneRepo = require("./cloneRepo");

fastify.post("/api/analyze",async(req,res)=>{
    const repoUrl=req.body.repoUrl
    if(!repoUrl){
        return res.code(400).send({error:"Repo Url is required"})
    }
    try{
        const repo= await cloneRepo(repoUrl)
        const files= await fs.readdir(repo.path)

        res.send({
            repository:repo.name,
            fileCount:fle.length,
            rootFiles:files
        })
    }catch(error){
        res.code(400).send({error:error.message})

    }

})

fastify.listen({port:3000},()=>{
    console.log("server running on http://localhost:3000")
})