import assert from 'node:assert/strict';
import {test} from 'node:test';
import {listenProgressFraction, quickQueue, quickStatus, repeatDuration, shouldAcceptListenTime} from '../features/stage-two/quick/flow.ts';
import {stageTwoLocation} from '../features/stage-two/location.ts';

test('Quick duration is exactly twice source duration, independent of listening speed', () => {
  assert.equal(repeatDuration({startMs:1000,endMs:46000}),90000);
  assert.equal(repeatDuration({startMs:1000,endMs:121000}),240000);
});
test('selected ranges and short sentence filtering retain source order', () => {
  const rows = [{text:'Skip this first sentence.'},{text:'Yes.'},{text:'Keep this longer sentence.'},{text:'Keep this one too.'}];
  assert.deepEqual(quickQueue(rows,1,2,true),[rows[2]]);
  assert.deepEqual(quickQueue(rows,1,2,false),[rows[1],rows[2]]);
});
test('pending, unavailable and failed evidence never becomes a passing score', () => {
  assert.equal(quickStatus(null,true,false),'pending');
  assert.equal(quickStatus(null,false,true),'unchecked');
  assert.equal(quickStatus({state:'failed'},true,true),'failed');
  assert.equal(quickStatus({state:'processing',word_check:{status:'uncertain'}},true,true),'unchecked');
  for (const [matched,expected] of [[59,'redo'],[60,'close'],[84,'close'],[85,'matched']]) {
    assert.equal(quickStatus({state:'processing',word_check:{status:'reliable',matched_count:matched,source_count:100}},true,true),expected);
  }
});
test('sentence selection preserves Detailed and Review modes, returns clear them', () => {
  const url = new URL('https://libitu.app/practice/aa000000-0000-4000-8000-000000000044/shadow?segmentId=one&shadowMode=detailed');
  assert.equal(stageTwoLocation(url,{segmentId:'one',sentenceId:'two'}).searchParams.get('shadowMode'),'detailed');
  assert.equal(stageTwoLocation(url,null).searchParams.has('shadowMode'),false);
});

import {startQuickPreparation} from '../features/stage-two/quick/preparation.ts';

test('Quick waits two full seconds before requesting the microphone', context => {
  context.mock.timers.enable({apis:['setTimeout']});
  const ticks=[];
  let requests=0;
  startQuickPreparation(seconds=>ticks.push(seconds),()=>requests++);
  assert.deepEqual(ticks,[2]);
  context.mock.timers.tick(1000);
  assert.deepEqual(ticks,[2,1]);
  context.mock.timers.tick(999);
  assert.equal(requests,0);
  context.mock.timers.tick(1);
  assert.equal(requests,1);
});

test('pausing either countdown step prevents a late microphone request', context => {
  context.mock.timers.enable({apis:['setTimeout']});
  for (const elapsed of [0,1000,1999]) {
    let requests=0;
    const cancel=startQuickPreparation(()=>{},()=>requests++);
    context.mock.timers.tick(elapsed);
    cancel();
    context.mock.timers.tick(3000);
    assert.equal(requests,0);
  }
});

test('a new playback receives a fresh preparation interval after pause', context => {
  context.mock.timers.enable({apis:['setTimeout']});
  let requests=0;
  const cancel=startQuickPreparation(()=>{},()=>requests++);
  context.mock.timers.tick(1500);
  cancel();
  startQuickPreparation(()=>{},()=>requests++);
  context.mock.timers.tick(1999);
  assert.equal(requests,0);
  context.mock.timers.tick(1);
  assert.equal(requests,1);
});

test('Quick listen time updates only accept events from the active listening source', () => {
  assert.equal(shouldAcceptListenTime('listening', 'reference', 'reference'), true);
  assert.equal(shouldAcceptListenTime('listening', 'reference', 'video'), false);
  assert.equal(shouldAcceptListenTime('listening', 'video', 'video'), true);
  assert.equal(shouldAcceptListenTime('listening', 'video', 'reference'), false);
  assert.equal(shouldAcceptListenTime('idle', 'video', 'video'), false);
  assert.equal(shouldAcceptListenTime('loading', 'reference', 'reference'), false);
  assert.equal(shouldAcceptListenTime('recording', 'reference', 'reference'), false);
});

test('listenProgressFraction tracks reference audio and video ranges without NaN or overshoot', () => {
  const sentence = {startMs: 10_000, endMs: 14_000};
  assert.equal(listenProgressFraction('reference', sentence, {audioCurrentTimeSeconds: 1.5, audioDurationSeconds: 3}), 0.5);
  assert.equal(listenProgressFraction('reference', sentence, {audioCurrentTimeSeconds: 2, audioDurationSeconds: Number.NaN}), 0.5);
  assert.equal(listenProgressFraction('reference', sentence, {audioCurrentTimeSeconds: 5, audioDurationSeconds: 3}), 1);
  assert.equal(listenProgressFraction('reference', sentence, {audioCurrentTimeSeconds: -0.5, audioDurationSeconds: 3}), 0);
  assert.equal(listenProgressFraction('video', sentence, {videoTimeSeconds: 12}), 0.5);
  assert.equal(listenProgressFraction('video', sentence, {videoTimeSeconds: 0}), 0);
  assert.equal(listenProgressFraction('video', sentence, {videoTimeSeconds: 20}), 1);
  assert.equal(listenProgressFraction('video', {startMs: 5000, endMs: 5000}, {videoTimeSeconds: 5}), 0);
});
