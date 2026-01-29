const fastify= require("fastify")({logger:true})
const fs=require("fs-extra");
const cloneRepo = require("./cloneRepo");
const scanFiles = require("./scanFiles");

fastify.register(require("@fastify/cors"),{
    origin:"http://localhost:5173"
})

fastify.post("/api/analyze",async(request,reply)=>{
    const {repoUrl}=request.body
    if(!repoUrl){
        return reply.code(400).send({error:"Repo Url is required"})
    }
    try{
        const repo= await cloneRepo(repoUrl)
        const files= await scanFiles(repo.path)
        

        return reply.send({
            repository:repo.name,
            fileCount:files.length,
            rootFiles:files
        })
    }catch(error){
        return reply.code(500).send({
            error: "Failed to analyze repository",
            message: error.message,
        })
    }

})

const start=async()=>{
    try{
        await fastify.listen({port:3000,host: "0.0.0.0"});
        console.log("server running on http://localhost:3000")
    }catch(error){
        fastify.log.error(error);
        process.exit(1);

    }
}
start();
