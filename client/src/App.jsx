import { useState } from "react"; 

export default function App(){
  const [repoUrl,setRepoUrl]=useState("")
  const [result,setResult]=useState(null)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState(null)

  async function analyzeRepo() {
    setLoading(true)
    setError(null)
    setResult(null)

    try{
      const response= await fetch("http://localhost:3000/api/analyze",{
        method:"POST",
        headers:{
          "Content-Type": "application/json"
        },
        body:JSON.stringify({repoUrl})
      })
      const data= await response.json()

      if(!response.ok){
        throw new Error("something went wrong")
      }
      setResult(data)

    }catch(error){
      setError(error.message)

    }finally{
      setLoading(false)
    }
    
  }
  return(
    <>

    <div className="min-h-screen flex items-center justify-center bg-grey-100">
      <div className="bg-white p-6 rounded shadow w-[500px]">
        <h1 className="text-2xl font-bold mb-4"> RepoLens</h1>
        <input 
        className="w-full border p-2 mb-3"
        placeholder="Paste GitHub repository URL"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}/>

        <button
        onClick={analyzeRepo}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
        >{loading?"Analyzing...": "Analyze"}</button>

        {error && (<p className="text-red-600 mt-3">{error}</p>)}
        {result && (<pre className="bg-gray-100 mt-4 p-3 text-sm overflow-auto">
        {JSON.stringify(result, null, 2)}
        </pre>)}

      </div>

    </div>
    </>

  )
}