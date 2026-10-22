import { RescueScene } from './game.js';
import { loadLeaderboard, saveScore } from './leaderboard.js';
import { HandTracking } from './handTracking.js';

const $ = (id) => document.getElementById(id);
const screens = ['home-screen','how-screen','game-screen','result-screen'];
const show = (id) => screens.forEach((screen) => $(screen).classList.toggle('hidden', screen !== id));
let game; let timeLeft=120; let rescued=0; let score=0; let timerHandle;
let handTracking; let gestureScene;
const formatTime = (seconds) => `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;

function startMission() {
  clearInterval(timerHandle); timeLeft=120;rescued=0;score=0;
  handTracking?.stop();handTracking=null;gestureScene=null;
  $('header-status').textContent='MISSION LIVE';$('rescue-count').textContent='0';$('score').textContent='0000';$('timer').textContent='02:00';$('timer-progress').style.width='100%';
  $('field-status').innerHTML='<span class="status-symbol">⌖</span><span>Select a survivor marker<br>on the map to start.</span>';
  document.querySelectorAll('.rescue-dots i').forEach(dot=>dot.classList.remove('done'));
  show('game-screen');
  if(game){game.destroy(true);game=null;}
  const width=Math.min($('game-container').clientWidth,900);const height=Math.round(width*.59);
  const scene=new RescueScene({status:setStatus,rescue:onRescue,clear:onClear});
  game=new Phaser.Game({type:Phaser.CANVAS,parent:'game-container',width,height,backgroundColor:'#19292d',scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[scene],render:{antialias:true,pixelArt:false}});gestureScene=scene;
  timerHandle=setInterval(()=>{timeLeft--; $('timer').textContent=formatTime(timeLeft);$('timer-progress').style.width=`${Math.max(0,timeLeft/120*100)}%`;if(timeLeft<=0)finishMission();},1000);
}
function setStatus(message){$('field-status').innerHTML=`<span class="status-symbol">⌖</span><span>${message}</span>`;}
function onRescue(){rescued++;score+=Math.max(100,Math.round(500*timeLeft/120));$('rescue-count').textContent=String(rescued);$('score').textContent=String(score).padStart(4,'0');document.querySelectorAll('.rescue-dots i')[rescued-1]?.classList.add('done');setStatus('Survivor brought to safety.');if(rescued===3)finishMission(true);}
function onClear(type){score+=type==='debris'?75:100;$('score').textContent=String(score).padStart(4,'0');setStatus(type==='debris'?'Debris cleared. Route may be open.':'Fire contained. Route may be open.');}
function finishMission(allRescued=false){clearInterval(timerHandle);timerHandle=null;handTracking?.stop();handTracking=null;gestureScene=null;if(game){game.destroy(true);game=null;}if(allRescued)score+=timeLeft*10;const leaderboard=saveScore(score,rescued);$('header-status').textContent='STANDBY';$('result-title').textContent=rescued===3?'Mission complete.':'Mission ended.';$('result-copy').textContent=rescued===3?'All survivors are safe. Excellent work, responder.':timeLeft===0?'Time ran out. Every second counts.':`You brought ${rescued} of 3 survivors to safety.`;$('final-rescues').textContent=`${rescued} / 3`;$('final-score').textContent=String(score).padStart(4,'0');$('final-time').textContent=formatTime(timeLeft);$('leaderboard-list').innerHTML=leaderboard.map((entry,index)=>`<li><span>${String(index+1).padStart(2,'0')} &nbsp; ${entry.date} · ${entry.rescued}/3 rescued</span><span>${String(entry.score).padStart(4,'0')}</span></li>`).join('')||'<li><span>No scores yet</span><span>—</span></li>';show('result-screen');}

async function enableCamera(){
  $('camera-button').disabled=true;$('camera-status').textContent='Starting…';
  handTracking=new HandTracking({video:$('camera-preview'),onPoint:(x,y,pinch)=>gestureScene?.setGestureCursor(x,y,pinch),onPinch:(x,y)=>gestureScene?.handleGestureClick(x,y),onStatus:(message)=>{$('camera-status').textContent=message;}});
  try{await handTracking.start();$('camera-button').textContent='Webcam active';$('input-mode').textContent='HAND GESTURES';$('field-status').innerHTML='<span class="status-symbol">⌖</span><span>Point with index finger.<br>Pinch to select or interact.</span>';}
  catch(error){handTracking?.stop();handTracking=null;$('camera-status').textContent=error.message;$('camera-button').disabled=false;$('input-mode').textContent='MOUSE FALLBACK';}
}

$('start-button').addEventListener('click',startMission);$('how-start-button').addEventListener('click',startMission);$('how-button').addEventListener('click',()=>show('how-screen'));$('home-back').addEventListener('click',()=>show('home-screen'));$('quit-button').addEventListener('click',()=>finishMission(false));$('retry-button').addEventListener('click',startMission);$('result-home-button').addEventListener('click',()=>{show('home-screen');$('header-status').textContent='STANDBY';});
$('camera-button').addEventListener('click',enableCamera);$('mouse-button').addEventListener('click',()=>{handTracking?.stop();handTracking=null;$('camera-status').textContent='Mouse fallback active';$('input-mode').textContent='MOUSE FALLBACK';$('camera-button').textContent='Enable webcam';$('camera-button').disabled=false;});
window.addEventListener('resize',()=>{if(game&&game.scale){const width=Math.min($('game-container').clientWidth,900);game.scale.resize(width,Math.round(width*.59));}});

// Display the existing local leaderboard on the debrief page after the first mission.
loadLeaderboard();
