// Pure product rules, shared by the UI, server and runnable checks.
export const SKILLS = ['Communication', 'Teamwork', 'Problem solving', 'Initiative', 'Adaptability', 'Leadership', 'Creativity', 'Resilience'];
export const AREAS = ['School & projects', 'Jobs & internships', 'Clubs & sport', 'Family responsibilities', 'Volunteering', 'Self-taught skills', 'Moving & change'];
export const RUBRIC = ['Answered the question', 'Specific', 'Shape', 'Ownership', 'So what'];
export const KEY = 'your-story.v1';
export const uid = () => crypto.randomUUID();
export const words = text => text.trim().split(/\s+/u).filter(Boolean);
export const escapeHTML = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function freshState() {
  return {version:1, revision:0, profile:{name:'',cv:'',cvDraft:'',target:'',posting:'',experiences:[],targetSkills:[]}, stories:[], attempts:[], drafts:[]};
}
const terms = {
  Communication:/communicat|present|explain|listen|writ|conversation/i,
  Teamwork:/team|collaborat|together|partner/i,
  'Problem solving':/problem|solv|debug|analys|analyz|research/i,
  Initiative:/initiat|independen|proactiv|start|volunteer/i,
  Adaptability:/adapt|chang|learn|uncertain|flexib/i,
  Leadership:/leadership|led\b|mentor|coordinat|manage|organis|organiz/i,
  Creativity:/creativ|design|idea|invent|build/i,
  Resilience:/resilien|setback|fail|persist|difficult/i,
};
export const suggestSkills = text => SKILLS.filter(s=>terms[s].test(text));
export const coverage = stories => Object.fromEntries(SKILLS.map(s=>[s,stories.filter(x=>x.skills.includes(s)).length]));
export function extractExperiences(cv) {
  // ponytail: line cues, not semantic CV parsing; a model can propose cues after user consent.
  return cv.split(/\r?\n/).map(s=>s.replace(/^\s*[-•*]\s*/, '').trim())
    .filter(s=>s.length>12 && s.length<240 && !/@|https?:\/\/|^\+?\d[\d\s()-]{6,}$/.test(s))
    .filter(s=>! /^(education|experience|skills|projects|references|summary)$/i.test(s)).slice(0,12);
}
const gaps = [
  'What is a time you helped someone understand something in a different way?',
  'What stands out from a time you worked alongside other people?',
  'What is a small thing you figured out that took more effort than people realised?',
  'What is something you chose to do without being asked?',
  'What changed unexpectedly in something you were part of, and how did you respond?',
  'What is a time other people looked to you for a next step?',
  'What is something you tried in your own way?',
  'What is something you kept working at when it was difficult?',
];
export function gapQuestion(skill) {return gaps[Math.max(0,SKILLS.indexOf(skill))];}
export function nextGap(state) {
  const counts=coverage(state.stories);
  return [...SKILLS].sort((a,b)=>counts[a]-counts[b] || Number(state.profile.targetSkills.includes(b))-Number(state.profile.targetSkills.includes(a)))[0];
}
export function question(stage, cue, answer='') {
  const quoted = answer ? ` When you say “${words(answer).slice(0,16).join(' ')}”, what specific moment comes to mind?` : '';
  return [
    `Thinking about ${cue || 'something you have been part of'}, what did you actually do day to day?`,
    quoted || 'Which particular moment from that experience stays with you?',
    'What did you personally do in that moment, and what choice did you make?',
    'What happened next? What changed, if anything?',
    'Why did that matter to you?',
    'What were you hoping to protect or make possible?',
    'What does that tell you about what you care about?',
  ][stage];
}
export function storyFromConversation(cue, answers) {
  return {id:uid(),title:words(answers[1] || cue || 'An everyday moment').slice(0,9).join(' '),context:answers[0]||'',moment:answers[1]||'',action:answers[2]||'',result:answers[3]||'',value:answers.at(-1)||'',skills:suggestSkills(answers.join(' ')).slice(0,3),omitted:false,confirmed:false,createdAt:new Date().toISOString(),source:cue,notes:answers.join('\n\n')};
}
export function validateStory(s) {
  if (!s || typeof s!=='object') throw Error('Invalid story.');
  for (const f of ['id','title','context','moment','action','result','value','createdAt','source','notes']) {
    if(typeof s[f]!=='string' || s[f].length>(f==='notes'?20000:f==='title'?160:5000)) throw Error(`Invalid story ${f}.`);
  }
  if (!s.id || !s.title.trim() || !s.moment.trim() || !s.action.trim() || !s.value.trim()) throw Error('Add a title, a moment, your action and what mattered.');
  if (!s.confirmed || typeof s.omitted!=='boolean') throw Error('Confirm the story happened before saving.');
  if(!Array.isArray(s.skills) || s.skills.length>3 || new Set(s.skills).size!==s.skills.length || s.skills.some(x=>!SKILLS.includes(x))) throw Error('Choose up to three different skills.');
  if(!Number.isFinite(Date.parse(s.createdAt))) throw Error('Invalid story date.');
  return s;
}
export function draftStory(s, format) {
  const fields = format==='intro' ? ['moment','action','value'] : format==='linkedin' ? ['moment','context','action','result','value'] : ['moment','context','action','result','value'];
  // Verbatim facts, with explicit gaps. Never pad a short story to hit a duration.
  return fields.map(k=>s[k]?.trim() || `[add detail: ${k==='result'?'what happened next':k}]`).join(format==='linkedin'?'\n\n':'\n');
}
export const band = score => score<40?'Not yet':score<80?'Almost':'Ready';
export function scoreAnswer(answer, prompt, story) {
  const text=answer.trim(), tokens=words(text), sentences=text.match(/[^.!?]+[.!?]?/g)?.map(x=>x.trim()).filter(Boolean)||[];
  const evidence = pattern=>sentences.find(s=>pattern.test(s))||'';
  const relevant = words(prompt.toLowerCase()).filter(w=>w.length>5 && !['question','describe','experience','something'].includes(w));
  const fit = sentences.find(s=>relevant.some(w=>s.toLowerCase().includes(w.replace(/[^a-z]/g,''))))||'';
  const concrete = evidence(/\b\d+\b|\b(when|during|before|after|because|decided|built|made|wrote|asked|found|tested|helped|organised|organized)\b/i);
  const own = evidence(/\bI\s+(?!was\b|am\b|think\b|feel\b)\w+/i);
  const result = evidence(/\b(result|learned|learnt|changed|improved|finished|completed|able|could|saved|reduced|increased|realised|realized|so that|finally)\b/i);
  // ponytail: transparent lexical coaching only. Validate against human raters before using for assessment.
  const scores = [fit?14:4,concrete?16:4,tokens.length>=100&&tokens.length<=230?18:tokens.length>=45?12:4,own?18:3,result?16:4];
  if(tokens.length<8) scores.fill(0);
  const quotes=[fit,concrete,sentences[0]||'',own,result];
  const fixes=[
    'Connect your example to the question in one clear sentence.',
    'Choose one real moment. Add what you saw and the action you took.',
    'Open at the moment that matters, then give your action and the outcome. Aim for 130–200 words.',
    'Make your own decision visible. Use “I” for your action and “we” for the team’s work.',
    'End with what changed, or what you learned. An honest small outcome is enough.',
  ];
  const rows=RUBRIC.map((name,i)=>({name,score:scores[i],quote:quotes[i]}));
  const low=scores.indexOf(Math.min(...scores)), high=scores.indexOf(Math.max(...scores));
  const ordered=[concrete,own,result,...sentences].filter(Boolean).filter((s,i,a)=>a.indexOf(s)===i);
  return {total:scores.reduce((a,b)=>a+b,0),rows,worked:scores[high]>4?`${RUBRIC[high]}: ${quotes[high] || 'You gave the answer a clear beginning.'}`:'You have a starting point. One specific moment is enough to build on.',fix:fixes[low],stronger:ordered.join(' '),method:'local',wordCount:tokens.length,iCount:(text.match(/\bI\b/g)||[]).length,weCount:(text.match(/\bwe\b/gi)||[]).length};
}
export function interviewQuestions(state, story) {
  const target=state.profile.target.trim();
  const context=target?` In the context of your goal, “${target}”,`:'';
  const skill=state.profile.targetSkills[0] || story?.skills[0] || nextGap(state);
  return [
    `Tell me about a time you made a difference.${context} what did you personally do and what happened?`,
    `${gapQuestion(skill)} What did you learn from it?`,
    `${gapQuestion(nextGap(state))} How would you use what you learned in a new situation?`,
  ];
}
export function findThread(stories) {
  if(stories.length<2) return null;
  const stop=new Set(['that','this','with','from','have','what','were','would','could','about','because','really','wanted','their','them','they','there','which','when','then','just','being','into','make','more','help']);
  const counts={};
  for(const s of stories) for(const w of new Set(s.value.toLowerCase().match(/[a-z]{4,}/g)||[])) if(!stop.has(w)) counts[w]=(counts[w]||0)+1;
  const [word,count]=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]||[];
  if(!word || count<2) return {title:'A thread worth exploring',text:'Read these values together. What feels connected to you?',quotes:stories.slice(0,3).map(s=>({id:s.id,title:s.title,value:s.value}))};
  return {title:`“${word}” keeps coming up`,text:`You used this word in the values of ${count} stories. What might connect them?`,quotes:stories.filter(s=>s.value.toLowerCase().includes(word)).slice(0,3).map(s=>({id:s.id,title:s.title,value:s.value}))};
}
export function cvDraft(state) {
  const p=state.profile;
  return [p.name,p.target?`Goal: ${p.target}`:'',p.cv?'EXISTING CV\n'+p.cv:'',p.experiences.length?'EXPERIENCES\n'+p.experiences.map(x=>'- '+x).join('\n'):'',state.stories.length?'EXPERIENCE EVIDENCE\n'+state.stories.map(s=>`${s.title}\n${s.action}${s.result?'\n'+s.result:''}`).join('\n\n'):'', '\nAdd and verify your contact information, dates, institutions and role titles before sharing.'].filter(Boolean).join('\n\n');
}
export function validateState(data) {
  if(!data || data.version!==1 || !Number.isSafeInteger(data.revision) || data.revision<0) throw Error('Unsupported or damaged backup. Your current data was not changed.');
  const p=data.profile;
  if(!p || ['name','cv','target','posting'].some(k=>typeof p[k]!=='string'||p[k].length>30000) || p.name.length>80 || p.target.length>300) throw Error('Invalid profile.');
  if(p.cvDraft!==undefined && (typeof p.cvDraft!=='string'||p.cvDraft.length>30000)) throw Error('Invalid CV draft.');
  if(!Array.isArray(p.experiences)||p.experiences.length>100||p.experiences.some(x=>typeof x!=='string'||x.length>500)) throw Error('Invalid experience list.');
  if(!Array.isArray(p.targetSkills)||p.targetSkills.length>8||p.targetSkills.some(x=>!SKILLS.includes(x))) throw Error('Invalid target skills.');
  for(const k of ['stories','attempts','drafts']) if(!Array.isArray(data[k])||data[k].length>1000) throw Error('Backup exceeds supported size.');
  data.stories.forEach(validateStory);
  for(const k of ['stories','attempts','drafts']) if(new Set(data[k].map(x=>x.id)).size!==data[k].length) throw Error('Duplicate record IDs.');
  const ids=new Set(data.stories.map(x=>x.id));
  for(const a of data.attempts) {
    if(!a || typeof a.id!=='string'||typeof a.answer!=='string'||!a.answer.trim()||a.answer.length>10000 || typeof a.question!=='string'||a.question.length>3000||!ids.has(a.storyId)||!['practice','test'].includes(a.mode)||typeof a.sessionId!=='string'||!Number.isFinite(Date.parse(a.createdAt))||a.confirmed!==true) throw Error('Invalid practice record.');
    const f=a.feedback;
    if(!f || !Number.isInteger(f.total)||f.total<0||f.total>100||!Array.isArray(f.rows)||f.rows.length!==5 || f.rows.some((r,i)=>r.name!==RUBRIC[i]||!Number.isInteger(r.score)||r.score<0||r.score>20||typeof r.quote!=='string'||(r.quote&&!a.answer.includes(r.quote))) || f.rows.reduce((n,r)=>n+r.score,0)!==f.total) throw Error('Invalid feedback evidence.');
    if(['worked','fix','stronger','method'].some(k=>typeof f[k]!=='string'||f[k].length>12000) || !['local','ai'].includes(f.method)||['wordCount','iCount','weCount'].some(k=>!Number.isInteger(f[k])||f[k]<0)) throw Error('Invalid feedback.');
  }
  for(const d of data.drafts) if(!d || typeof d.id!=='string'||!ids.has(d.storyId)||!['interview','intro','linkedin'].includes(d.format)||typeof d.text!=='string'||d.text.length>20000||!Number.isFinite(Date.parse(d.createdAt))) throw Error('Invalid studio draft.');
  // Rebuild the envelope to avoid carrying unrelated fields in imported backups.
  return {version:1,revision:data.revision,profile:{name:p.name,cv:p.cv,cvDraft:p.cvDraft||'',target:p.target,posting:p.posting,experiences:[...p.experiences],targetSkills:[...new Set(p.targetSkills)]},stories:data.stories,attempts:data.attempts,drafts:data.drafts};
}
export function deleteStory(state,id) {
  return {...state,stories:state.stories.filter(x=>x.id!==id),attempts:state.attempts.filter(x=>x.storyId!==id),drafts:state.drafts.filter(x=>x.storyId!==id)};
}
export function persistState(next,storage,expectedRaw){
  const checked=validateState(next);
  if(storage.getItem(KEY)!==expectedRaw)throw Error('Your data changed in another tab. Reload before saving; copy any unsaved text first.');
  const serialized=JSON.stringify(checked);
  try{storage.setItem(KEY,serialized);}catch{throw Error('This device could not save. Export your data or free browser storage, then try again.');}
  return {state:checked,raw:serialized};
}
export function sampleState() {
  const state=freshState();
  state.profile={name:'Alex',cv:'',cvDraft:'',target:'Community programme internship',posting:'Collaborate with a team, communicate clearly and solve problems creatively.',experiences:['Campus science fair','Helping my brother with maths','Weekend café shift'],targetSkills:['Communication','Teamwork','Problem solving']};
  state.stories=[
    {title:'Two tables. No power. Ten minutes to go.',context:'I was helping set up our campus science fair.',moment:'Ten minutes before opening, two project tables had no power.',action:'I asked the facilities team for an extension lead and moved the tables to a working outlet.',result:'Both teams were able to show their projects when the doors opened.',value:'Making sure someone’s work gets seen matters to me.',skills:['Problem solving','Initiative','Teamwork'],omitted:true,source:'Campus science fair'},
    {title:'A different way to explain fractions',context:'I help my younger brother with maths after school.',moment:'He told me he was bad at fractions and closed his book.',action:'I drew a pizza and asked him to split it between us. Then I let him explain the next problem to me.',result:'He completed the next three questions on his own.',value:'I care about helping people feel seen and capable.',skills:['Communication','Creativity'],omitted:true,source:'Family responsibilities'},
    {title:'Finding our rhythm on a busy Saturday',context:'I work weekend shifts at a local café.',moment:'Our new teammate was struggling to keep up with orders.',action:'I asked which part was confusing, wrote a short checklist with her, and took over drinks while she practised.',result:'By the end of the shift she was handling the orders independently.',value:'I want people to feel supported when they are learning.',skills:['Leadership','Adaptability','Teamwork'],omitted:false,source:'Weekend café shift'},
  ].map((s,i)=>({...s,id:`sample-${i}`,createdAt:new Date(Date.now()-(i+1)*86400000).toISOString(),notes:'Fictional example for exploring Your Story.',confirmed:true}));
  return state;
}
