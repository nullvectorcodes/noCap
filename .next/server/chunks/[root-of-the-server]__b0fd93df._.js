module.exports=[70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},24361,(e,t,r)=>{t.exports=e.x("util",()=>require("util"))},14747,(e,t,r)=>{t.exports=e.x("path",()=>require("path"))},42116,e=>{"use strict";let t={baseUrl:process.env.LM_STUDIO_BASE_URL||"http://127.0.0.1:1234/v1",timeoutMs:25e3};async function r(e){try{let t=await fetch(`${e}/models`,{signal:AbortSignal.timeout(2e3),headers:{"Content-Type":"application/json"}});if(!t.ok)throw Error(`Status ${t.status}`);let r=await t.json(),n=r.data?.find(e=>!e.id.includes("embedding"));if(!n)return null;return{id:n.id,isChat:n.id.toLowerCase().includes("instruct")||n.id.toLowerCase().includes("chat")||n.id.toLowerCase().includes("gpt")}}catch(e){return console.warn("[Capability Detection Failed]",e),null}}async function n(e,a="English"){let s=process.env.LM_STUDIO_MODEL,i="chat/completions";if(!s){let e=await r(t.baseUrl);e?s=e.id:(console.warn("Could not detect model, failing over to default."),s="local-model")}let o=`You are noCap, a gen-z slang expert.
You must analyze the user's message and output the result in ${a}.

Your task:
1. Analyze the user's message.
2. "sentence_meaning": Provide a VIBE-BASED translation in ${a}. Capture the emotion and intent.
3. "terms": Identify specific slang phrases. 
   - CRITICAL: Treat multi-word slang as SINGLE units (e.g. "Oh hell naw").
   - Meaning: Explain the usage/context purely in ${a}.
   - Example: A natural usage example (keep the slang in English, but you can translate the rest of the sentence to ${a} if appropriate).
4. Output STRICTLY a valid JSON object.

Output Language: ${a}
Output Language: ${a}
Output Language: ${a}

Structure:
{
  "sentence_meaning": "The overall translation/vibe written in ${a}.",
  "terms": [
    {
      "term": "phrase or word",
      "meaning": "definition written in ${a}",
      "example": "usage example"
    }
  ]
}`,l={model:s,messages:[{role:"system",content:o},{role:"user",content:`${e}

IMPORTANT: Provide all definitions and translations in ${a}.`}],temperature:.3,stream:!1};console.log(`[Request] Sending to ${t.baseUrl}/${i} with model ${s} | Language: ${a}`);let p=await fetch(`${t.baseUrl}/${i}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(l),signal:AbortSignal.timeout(t.timeoutMs)});if(!p.ok&&(404===p.status||400===p.status)){console.warn(`[First Attempt Failed] ${p.status}. Retrying with legacy completion endpoint...`);let r={model:s,prompt:`${o}

User: ${e}

IMPORTANT: Provide all definitions and translations in ${a}.

Response:`,temperature:.3,max_tokens:500};p=await fetch(`${t.baseUrl}/completions`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r),signal:AbortSignal.timeout(t.timeoutMs)})}if(!p.ok)throw Error(`LM Studio error: ${p.statusText}`);let u=await p.json();return u.choices?.[0]?.message?.content?u.choices[0].message.content:u.choices?.[0]?.text?u.choices[0].text:"No response generated."}e.s(["analyzeText",()=>n])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__b0fd93df._.js.map