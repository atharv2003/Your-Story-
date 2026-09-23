import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {loadEnvFile} from 'node:process';
import {coach,validateRequest,DEFAULT_MODEL} from './ai.mjs';

const root=path.resolve(fileURLToPath(new URL('./dist/',import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const headers={'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'self'"};
export function createServer({fetcher=fetch,key=process.env.GEMINI_API_KEY?.trim(),model=process.env.GEMINI_MODEL?.trim()||DEFAULT_MODEL}={}) {
  let inFlight=0,windowStart=Date.now(),requests=0;
  const json=(res,status,data)=>{res.writeHead(status,{...headers,'Content-Type':'application/json'});res.end(JSON.stringify(data));};
  return http.createServer(async(req,res)=>{
    try {
      const host=req.headers.host;
      if(!host || !/^(127\.0\.0\.1|localhost):\d+$/.test(host)) {res.writeHead(403,headers);res.end('Local connections only');return;}
      const url=new URL(req.url,'http://'+host);
      if(url.pathname==='/api/config'&&req.method==='GET') {json(res,200,{ai:Boolean(key&&model)});return;}
      if(url.pathname==='/api/coach') {
        if(req.method!=='POST'){json(res,405,{error:'POST required'});return;}
        if(req.headers.origin!==`http://${host}` || !req.headers['content-type']?.startsWith('application/json')){json(res,403,{error:'Same-origin JSON required'});return;}
        if(!key||!model){json(res,503,{error:'AI is not configured'});return;}
        if(Date.now()-windowStart>60000){requests=0;windowStart=Date.now();}
        if(inFlight>=2||requests>=20){json(res,429,{error:'Please try again shortly'});return;}
        requests++;inFlight++;
        try {
          const chunks=[];let size=0;
          for await(const chunk of req){size+=chunk.length;if(size>60000){json(res,413,{error:'Request too large'});return;}chunks.push(chunk);}
          let body;try{body=JSON.parse(Buffer.concat(chunks).toString('utf8'));validateRequest(body);}catch{json(res,400,{error:'Invalid input or missing consent'});return;}
          const result=await coach(body,{key,model,fetcher});json(res,200,result);
        } catch(error) {json(res,[429,503].includes(error.status)?error.status:502,{error:[429,503].includes(error.status)?error.message:'Gemini could not respond safely. Use guided mode.'});}
        finally {inFlight--;}
        return;
      }
      if(url.pathname.startsWith('/api/')) {res.writeHead(404,headers);res.end('Not configured');return;}
      if(!['GET','HEAD'].includes(req.method)) {res.writeHead(405,headers);res.end();return;}
      const pathname=decodeURIComponent(url.pathname);
      const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
      if(!file.startsWith(root+path.sep) || !types[path.extname(file)]) {res.writeHead(404,headers);res.end('Not found');return;}
      const body=await readFile(file);
      res.writeHead(200,{...headers,'Content-Type':types[path.extname(file)]});res.end(req.method==='HEAD'?undefined:body);
    } catch(error) {res.writeHead(error.code==='ENOENT'?404:400,headers);res.end('Unable to serve request');}
  });
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try{loadEnvFile(fileURLToPath(new URL('./.env',import.meta.url)));}catch(error){if(error.code!=='ENOENT')throw Error('Could not read .env. Check the file format and permissions.');}
  const port=Number(process.env.PORT||4173);
  createServer().listen(port,'127.0.0.1',()=>console.log(`Your Story: http://127.0.0.1:${port}\n${process.env.GEMINI_API_KEY?.trim()?'Gemini configured. Enable it in Settings after reviewing consent.':'Guided mode. Add GEMINI_API_KEY to .env, then restart to enable Gemini.'}`));
}

