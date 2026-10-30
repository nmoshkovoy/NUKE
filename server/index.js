import http from 'node:http';
import {createServer as createViteServer} from 'vite';
import {generateLesson,generateLocalLesson,validateInput} from './lesson.js';
try{process.loadEnvFile('.env');}catch(e){if(e.code!=='ENOENT')throw e;}
const vite=await createViteServer({server:{middlewareMode:true},appType:'spa'});
const provider=process.env.AI_PROVIDER||'ollama';
let busy=false,lastRequest=0;
const server=http.createServer(async(req,res)=>{
 if(!req.url.startsWith('/api/'))return vite.middlewares(req,res);
 res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
 const send=(status,data)=>{res.writeHead(status);res.end(JSON.stringify(data));};
 if(req.url==='/api/health'&&req.method==='GET'){
 if(provider==='openai')return send(200,{provider,configured:!!process.env.OPENAI_API_KEY});
 try{const r=await fetch('http://127.0.0.1:11434/api/tags',{signal:AbortSignal.timeout(2000)});const d=await r.json();const model=process.env.OLLAMA_MODEL||'gemma3:4b';return send(200,{provider:'ollama',configured:(d.models||[]).some(m=>m.name===model),running:true,model});}
 catch{return send(200,{provider:'ollama',configured:false,running:false});}
 }
 if(req.url!=='/api/lessons'||req.method!=='POST')return send(404,{error:'Not found'});
 // Local development endpoint: reject requests from other websites.
 if(req.headers.origin&&req.headers.origin!==`http://${req.headers.host}`)return send(403,{error:'Cross-site requests are not allowed.'});
 if(provider==='openai'&&!process.env.OPENAI_API_KEY)return send(503,{error:'AI is not configured yet. Add OPENAI_API_KEY to the .env file and restart NUKE. See README.md.'});
 if(busy||Date.now()-lastRequest<5000)return send(429,{error:'Please wait a moment before generating another lesson.'});
 let size=0,chunks=[];
 try{for await(const chunk of req){size+=chunk.length;if(size>24*1024*1024){send(413,{error:'Images are too large. Try fewer or smaller images.'});return;}chunks.push(chunk);}}catch{return;}
 let input;try{input=JSON.parse(Buffer.concat(chunks).toString());}catch{return send(400,{error:'Invalid request.'});}
 if(!validateInput(input))return send(400,{error:'Choose a subject and add notes or up to 4 PNG, JPEG, or WebP images.'});
 busy=true;lastRequest=Date.now();
 try{send(200,{lesson:provider==='openai'?await generateLesson(input,{key:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL||'gpt-4.1-mini'}):await generateLocalLesson(input,{model:process.env.OLLAMA_MODEL||'gemma3:4b'})});}
 catch(e){send(e.status||502,{error:e.name==='TimeoutError'?'Generation timed out. Try fewer images.':e.message});}
 finally{busy=false;}
});
server.listen(Number(process.env.PORT)||5173,'127.0.0.1',()=>console.log('NUKE ready at http://localhost:'+(process.env.PORT||5173)));
