const canvas = document.querySelector('#game'), ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score'), bestEl = document.querySelector('#best');
const startBtn = document.querySelector('#start'), pauseBtn = document.querySelector('#pause');
const statusEl = document.querySelector('#status'), speedEl = document.querySelector('#speed');
const cols = 28, rows = 16, cell = 36;
let snake, direction, next, food, score, best = 0, state = 'ready', timer;
try { best = Number(localStorage.getItem('peach-snake-best')) || 0; } catch {}
bestEl.textContent = best;
const dirs = {up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
function spawnFood() {
  const free = [];
  for(let y=0;y<rows;y++) for(let x=0;x<cols;x++)
    if(!snake.some(s=>s.x===x&&s.y===y)) free.push({x,y});
  return free[Math.floor(Math.random()*free.length)];
}
function reset() {
  snake = [{x:9,y:8},{x:8,y:8},{x:7,y:8},{x:6,y:8}];
  direction = next = dirs.right; score=0; scoreEl.textContent=0; food=spawnFood();
}
function round(x,y,w,h,r,color) {
  ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();
}
function draw() {
  ctx.fillStyle='#fffaf4';ctx.fillRect(0,0,canvas.width,canvas.height);
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)
    round(x*cell+3,y*cell+3,30,30,8,(x+y)%3===0?'#d4edf7':'#eaf4f8');
  if(food){
    const x=food.x*cell+18,y=food.y*cell+18;
    ctx.fillStyle='#ec457b';ctx.beginPath();ctx.moveTo(x,y+12);
    ctx.bezierCurveTo(x-24,y-3,x-12,y-17,x,y-8);
    ctx.bezierCurveTo(x+12,y-17,x+24,y-3,x,y+12);ctx.fill();
    ctx.strokeStyle='#287f68';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-6,y-12);ctx.lineTo(x,y-8);ctx.lineTo(x+6,y-12);ctx.stroke();
    ctx.fillStyle='#ffe8a3';for(const [dx,dy] of [[-5,-2],[5,-2],[0,5]]){ctx.beginPath();ctx.ellipse(x+dx,y+dy,1,2,0,0,7);ctx.fill();}
  }
  for(let i=snake.length-1;i>=0;i--){const s=snake[i];round(s.x*cell+2,s.y*cell+2,32,32,12,i===0?'#f77fac':i%2?'#f8b1d0':'#f498bf');}
  const head=snake[0];ctx.save();ctx.translate(head.x*cell+18,head.y*cell+18);
  const angle=direction.x===1?0:direction.x===-1?Math.PI:direction.y===1?Math.PI/2:-Math.PI/2;
  ctx.rotate(angle);
  for(const y of [-6,6]){ctx.fillStyle='#61364c';ctx.beginPath();ctx.ellipse(5,y,3,3.8,0,0,7);ctx.fill();ctx.fillStyle='white';ctx.beginPath();ctx.arc(6,y-1,1,0,7);ctx.fill();}
  ctx.fillStyle='#e55288';for(const y of [-10,10]){ctx.beginPath();ctx.ellipse(0,y,3,2,0,0,7);ctx.fill();}
  ctx.strokeStyle='#61364c';ctx.lineWidth=1.7;ctx.beginPath();ctx.arc(8,0,3,-Math.PI/2,Math.PI/2);ctx.stroke();ctx.restore();
}
function finish(won=false){
  clearInterval(timer);state='over';pauseBtn.disabled=true;startBtn.textContent='再玩一次';
  statusEl.textContent=won?'整片草莓园都被你吃光了！':'哎呀，咬到自己了。再来一局？';
}
function tick(){
  direction=next;
  const h={x:(snake[0].x+direction.x+cols)%cols,y:(snake[0].y+direction.y+rows)%rows};
  const ate=h.x===food.x&&h.y===food.y;
  if(snake.slice(0,ate?snake.length:-1).some(s=>s.x===h.x&&s.y===h.y)){finish();return;}
  snake.unshift(h);
  if(ate){score++;scoreEl.textContent=score;statusEl.textContent=['好甜！再吃一颗。','桃桃又长大了一点。','这颗草莓是你的！'][score%3];
    if(score>best){best=score;bestEl.textContent=best;try{localStorage.setItem('peach-snake-best',best);}catch{}}
    food=spawnFood();if(!food)finish(true);
  }else snake.pop();
  draw();
}
function schedule(){clearInterval(timer);timer=setInterval(tick,Number(speedEl.value));}
function start(){clearInterval(timer);reset();state='playing';pauseBtn.disabled=false;pauseBtn.textContent='暂停';startBtn.textContent='重新开始';statusEl.textContent='出发！跟着草莓的方向走。';draw();schedule();}
function pause(){
  if(state==='playing'){state='paused';clearInterval(timer);pauseBtn.textContent='继续';statusEl.textContent='休息一下。桃桃等你回来。';}
  else if(state==='paused'){state='playing';pauseBtn.textContent='暂停';statusEl.textContent='继续找草莓！';schedule();}
}
function turn(name){const d=dirs[name];if(state==='playing'&&!(d.x===-direction.x&&d.y===-direction.y))next=d;}
startBtn.addEventListener('click',start);pauseBtn.addEventListener('click',pause);
speedEl.addEventListener('change',()=>{if(state==='playing')schedule();});
const keys={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='SELECT')return;
  const d=keys[e.key]||keys[e.key.toLowerCase()];
  if(d){e.preventDefault();turn(d);}else if(e.code==='Space'&&e.target.tagName!=='BUTTON'){e.preventDefault();pause();}
});
document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>turn(b.dataset.dir)));
let touch;
canvas.addEventListener('pointerdown',e=>{touch={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointerup',e=>{if(!touch)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))>10)turn(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');});
canvas.addEventListener('pointercancel',()=>{touch=null;});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause();});
reset();draw();
