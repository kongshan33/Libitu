import assert from 'node:assert/strict';
import test from 'node:test';
import {timelineColumns,columnWidth,wordColumnWidth,fitTimelineZoom,timelineTicks,pitchPath,timelinePitchPath,envelopePath} from '../features/stage-two/comparison/timeline.ts';
const word=(start,end,pause=0)=>({text:'hello',startMs:start,endMs:end,pause,match:'matched'});
const signal={time_step_sec:.05,pitch_st:[1,null,2],words:[{source_index:0,value:.6,uncertain:true}],display_frames:[{time_sec:0,pitch_st:1,energy_dbfs:-20},{time_sec:.02,pitch_st:null,energy_dbfs:-24},{time_sec:.04,pitch_st:2,energy_dbfs:-22}]};
const data={state:'completed',result:{comparison:'available',learner:{rhythm_signal:signal},reference:{rhythm_signal:signal}}};
test('source-aligned columns retain each duration and use the longer voice for width',()=>{
 const [c]=timelineColumns({yours:{words:[word(0,400)]},reference:{words:[word(0,250)]}},data);
 assert.equal(c.duration,400);assert.equal(c.reference.duration,250);assert.equal(c.yours.duration,400);assert.equal(columnWidth(c,.18,50),72);
 assert.equal(c.yours.prominence,.6);assert.equal(c.yours.uncertain,true);
});
test('substitutions cannot inherit exact-match measurements or pitch',()=>{
 const [c]=timelineColumns({yours:{words:[{...word(0,400),match:'substituted'}]},reference:{words:[word(0,250)]}},data);
 assert.equal(c.yours.duration,null);assert.equal(c.yours.prominence,null);assert.deepEqual(c.yours.frames,[]);
});
test('frame paths break at unvoiced intervals and missing-frame gaps',()=>{
 const path=pitchPath([{time:0,pitch:1},{time:.02,pitch:null},{time:.04,pitch:2},{time:.4,pitch:3}],.18);
 assert.equal((path.match(/M/g)||[]).length,3);assert.equal((path.match(/L/g)||[]).length,0);
});
test('historical signals use actual coarse frames and never invent energy',()=>{
 const old={...signal,display_frames:undefined};
 const [c]=timelineColumns({yours:{words:[word(0,400)]},reference:{words:[]}}, {state:'completed',result:{comparison:'unavailable',learner:{rhythm_signal:old},reference:null}});
 assert.deepEqual(c.yours.frames.map(f=>f.pitch),[1,null,2]);assert.ok(c.yours.frames.every(f=>f.energy===null));assert.equal(envelopePath(c.yours.frames,.18,-20),'');
});
test('pending and deleted takes never reuse cached measurement curves',()=>{
 for(const state of ['processing','deleted']) {
  const [c]=timelineColumns({yours:{words:[word(0,400)]},reference:{words:[]}}, {...data,state});
  assert.equal(c.yours.prominence,null);assert.deepEqual(c.yours.frames,[]);
 }
});

test('selected saved take survives same-sentence mode navigation but clears on sentence change',async()=>{
 const {stageTwoLocation}=await import('../features/stage-two/location.ts');
 const url=new URL('https://libitu.test/practice/aa000000-0000-4000-8000-000000000044/shadow?segmentId=seg&sentenceId=sentence&shadowMode=detailed&takeId=older');
 assert.equal(stageTwoLocation(url,{segmentId:'seg',sentenceId:'sentence'}).searchParams.get('takeId'),'older');
 assert.equal(stageTwoLocation(url,{segmentId:'seg',sentenceId:'other'}).searchParams.get('takeId'),null);
});


test('short and unmeasured words keep readable label space without stretching measurements',()=>{
 const c={text:'distribution',index:0,duration:120};
 for(const zoom of [.06,.18,.6])assert.equal(columnWidth(c,zoom,85),105);
 assert.equal(columnWidth({...c,duration:0},.06,85),105);
 assert.equal(c.duration,120);
});
test('Fit respects readable widths and allows scrolling when labels cannot fit',()=>{
 const columns=[{text:'same',duration:230,index:0},{text:'distribution',duration:200,index:1}];
 const labels=[40,90];
 assert.equal(fitTimelineZoom(columns,labels,100),.06);
 const zoom=fitTimelineZoom(columns,labels,220);
 assert.ok(columns.reduce((sum,c,i)=>sum+columnWidth(c,zoom,labels[i]),0)<=220.001);
 assert.ok(zoom>.06 && zoom<=.6);
});
test('single-voice ruler follows that recording clock including pauses and label space',()=>{
 const view={yours:{words:[word(100,200,300),word(500,1600)]},reference:{words:[word(2000,2200,100),word(2300,2600)]}};
 const columns=timelineColumns(view,data);
 assert.equal(columns[0].yours.gap,300);
 assert.equal(columns[0].yours.pause,300);
 assert.equal(columns[0].duration,400);
 assert.deepEqual(timelineTicks(columns,.18,[80,50],'yours'),[{second:1,left:190}]);
 assert.deepEqual(timelineTicks(columns,.18,[80,50],'reference'),[{second:2,left:0}]);
});
test('unknown boundaries and inserted speech do not become measured pauses',()=>{
 const columns=timelineColumns({yours:{words:[word(0,100,null),word(500,800)]},reference:{words:[]}},data);
 assert.equal(columns[0].yours.gap,0);assert.equal(columns[0].yours.pause,null);
});
test('a long pause stays on the time axis outside the word selection',()=>{
 const columns=timelineColumns({yours:{words:[word(0,1680,3008),word(4688,4900)]},reference:{words:[]}},data);
 for(const zoom of [.06,.18,.6]) {
  assert.equal(wordColumnWidth(columns[0],zoom,25),1680*zoom);
  assert.ok(Math.abs(columnWidth(columns[0],zoom,25)-wordColumnWidth(columns[0],zoom,25)-3008*zoom)<1e-6);
 }
 assert.equal(timelineTicks(columns,.18,[25,25])[3].left,540);
});
test('Sound All includes vowel-length reading cues and filters preserve source marks',async()=>{
 const {visibleSoundMarks}=await import('../features/stage-two/sound/phenomena.ts');
 const marks=[{kind:'linking'},{kind:'weak_form'},{kind:'flap'},{kind:'vowel_length'}];
 assert.deepEqual(visibleSoundMarks(marks).map(m=>m.kind),['linking','weak_form','flap','vowel_length']);
 assert.deepEqual(visibleSoundMarks(marks,'vowel_length').map(m=>m.kind),['vowel_length']);
 assert.equal(marks.length,4);
});
test('Melody joins continuous voiced word boundaries but breaks on silence and missing frames',()=>{
 const continuous={...signal,display_frames:Array.from({length:4},(_,i)=>({time_sec:i*.02,pitch_st:i,energy_dbfs:-20}))};
 const analysis={state:'completed',result:{comparison:'unavailable',learner:{rhythm_signal:continuous}}};
 const view={yours:{words:[word(0,40),word(40,80)]},reference:{words:[]}};
 let columns=timelineColumns(view,analysis);
 let path=timelinePitchPath(columns,'yours',.18,[50,50]);
 assert.equal((path.match(/M/g)||[]).length,1);assert.equal((path.match(/L/g)||[]).length,3);
 continuous.display_frames[1].pitch_st=null;
 columns=timelineColumns(view,analysis);path=timelinePitchPath(columns,'yours',.18,[50,50]);
 assert.equal((path.match(/M/g)||[]).length,2);
 continuous.display_frames[1].pitch_st=1;view.yours.words[0].pause=10;
 columns=timelineColumns(view,analysis);path=timelinePitchPath(columns,'yours',.18,[50,50]);
 assert.equal((path.match(/M/g)||[]).length,2);
});
test('a missing 20ms pitch frame breaks the curve rather than bridging the hole',()=>{
 assert.equal((pitchPath([{time:0,pitch:1},{time:.04,pitch:2}],.18).match(/M/g)||[]).length,2);
});
test('history statuses describe every take, with current analysis overriding an older list snapshot',async()=>{
 const {takeAnalysisStatus}=await import('../features/stage-two/persistence/analysis-status.ts');
 assert.equal(takeAnalysisStatus({id:'a',analysis_state:'completed',analysis_scope:'all_layers'}),'Analyzed');
 assert.equal(takeAnalysisStatus({id:'a',analysis_state:'completed',analysis_scope:'none'}),'Word check saved');
 assert.equal(takeAnalysisStatus({id:'a',analysis_state:'queued'},{id:'a',state:'failed'}),'Analysis failed');
 assert.equal(takeAnalysisStatus({id:'a',analysis_state:'queued'},{id:'b',state:'completed'}),'Queued');
 assert.equal(takeAnalysisStatus({id:'a'}),'Not analyzed');
});
