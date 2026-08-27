(function(){
  'use strict';

  var STATES={
    /* Six authored idle micro-poses use deliberately uneven timing. */
    idle:{row:0,frames:6,ms:190,durations:[1680,660,660,840,840,1920],loop:true},
    right:{row:1,frames:8,ms:82,loop:true},
    left:{row:2,frames:8,ms:82,loop:true},
    waving:{row:3,frames:4,ms:145,loop:false,hold:360},
    jumping:{row:4,frames:5,ms:110,loop:false,hold:300},
    failed:{row:5,frames:8,ms:125,loop:false,hold:1100},
    waiting:{row:6,frames:6,ms:185,loop:true},
    running:{row:7,frames:6,ms:105,loop:true},
    review:{row:8,frames:6,ms:145,loop:false,hold:900},
    delivering:{row:8,frames:6,ms:145,loop:false}
  };
  var STORE='felinia.rooftopCourier.position.v1';
  var pet,sprite,game,menu,narr,gameInput,eraSel,opening,state='idle',frame=0,timer=0,returnTimer=0;
  var dragging=false,moved=false,startX=0,startY=0,startL=0,startT=0,lastX=0;
  var lookTimer=0,moveRaf=0,deliveryTimer=0,roamTimer=0,menuWaveTimer=0,openingTypingTimer=0,gameActionTimer=0;
  var moving=false,jobPhase='idle',surface='none',menuWaveDue=false;
  var menuActionIndex=0,gameActionIndex=0;
  var genWasActive=false,tokenWas=false;
  var MENU_PACE=1.45,MENU_STOP_ACTION_SLOWDOWN=2;
  var returnToTopLeft=true;

  function draw(row,col){
    sprite.style.backgroundPosition=(col/7*100)+'% '+(row/10*100)+'%';
  }

  function drawLookSlot(slot){
    slot=(slot+16)%16;
    draw(slot<8?9:10,slot<8?slot:slot-8);
  }

  function restState(){return surface==='menu'?'waiting':'idle';}

  function stopAnimation(){
    if(timer){clearTimeout(timer);timer=0;}
    if(returnTimer){clearTimeout(returnTimer);returnTimer=0;}
  }

  function setState(next,force){
    if(!STATES[next])return;
    if(!force&&state===next&&timer)return;
    sprite.classList.remove('fePetLookAlive');
    stopAnimation();state=next;frame=0;
    var spec=STATES[next],pace=1;
    if(surface==='menu')pace=(next==='right'||next==='left')?MENU_PACE:MENU_PACE*MENU_STOP_ACTION_SLOWDOWN;
    draw(spec.row,0);
    function advance(){
      frame++;
      if(frame>=spec.frames){
        if(spec.loop)frame=0;
        else{
          timer=0;frame=spec.frames-1;
          if(spec.hold!=null)returnTimer=setTimeout(function(){setState(jobPhase==='idle'?restState():'running',true);},spec.hold*pace);
          return;
        }
      }
      draw(spec.row,frame);
      timer=setTimeout(advance,((spec.durations&&spec.durations[frame])||spec.ms)*pace);
    }
    timer=setTimeout(advance,((spec.durations&&spec.durations[0])||spec.ms)*pace);
  }

  function lookAt(clientX,clientY,target){
    if(surface==='opening'||dragging||moving||jobPhase!=='idle'||state==='waving'||state==='jumping'||state==='review'||state==='failed')return;
    var r=pet.getBoundingClientRect();
    var dx=clientX-(r.left+r.width/2),dy=clientY-(r.top+r.height*.42);
    /* 正文输入栏贴着屏幕底部：照绝对坐标会把整条输入栏判成「向下看」，
       帽檐遮住脸，看起来反而像背对玩家。输入栏内优先追踪左右位置，
       让她明确朝着光标所在的一侧看。 */
    if(nearGameInput(clientX,clientY,target))dy=0;
    if(Math.abs(dx)<16&&Math.abs(dy)<16)return;
    var deg=(Math.atan2(dx,-dy)*180/Math.PI+360)%360;
    var slot=Math.round(deg/22.5)%16;
    stopAnimation();state='look';
    /* Keep the exact direction cell, then add a tiny horizontal body sway so
       tracking still feels alive without changing angle, height, or scale. */
    drawLookSlot(slot);
    sprite.classList.add('fePetLookAlive');
    clearTimeout(lookTimer);
    lookTimer=setTimeout(function(){if(!dragging&&!moving&&jobPhase==='idle')setState(restState(),true);},2800);
  }

  function clamp(left,top){
    var pad=4,w=pet.offsetWidth,h=pet.offsetHeight;
    return {
      left:Math.max(pad,Math.min(innerWidth-w-pad,left)),
      top:Math.max(42,Math.min(innerHeight-h-pad,top))
    };
  }

  function place(left,top,save){
    var p=clamp(left,top);
    pet.style.left=p.left+'px';pet.style.top=p.top+'px';
    if(save){
      try{localStorage.setItem(STORE,JSON.stringify({x:p.left/Math.max(1,innerWidth-pet.offsetWidth),y:p.top/Math.max(1,innerHeight-pet.offsetHeight)}));}catch(_){}
    }
  }

  function restore(){
    var raw=null;
    try{raw=JSON.parse(localStorage.getItem(STORE)||'null');}catch(_){}
    if(raw&&isFinite(raw.x)&&isFinite(raw.y))place(raw.x*(innerWidth-pet.offsetWidth),raw.y*(innerHeight-pet.offsetHeight),false);
    else place(innerWidth-pet.offsetWidth-72,innerHeight-pet.offsetHeight-86,false);
  }

  function cancelMove(){
    if(moveRaf){cancelAnimationFrame(moveRaf);moveRaf=0;}
    moving=false;pet.classList.remove('fePetRun');
  }

  function moveTo(left,top,done,save){
    cancelMove();
    var from=pet.getBoundingClientRect(),to=clamp(left,top);
    var dx=to.left-from.left,dy=to.top-from.top,dist=Math.sqrt(dx*dx+dy*dy);
    var inMenu=surface==='menu';
    var duration=inMenu?Math.max(900,Math.min(3200,dist*4.1))
                       :Math.max(460,Math.min(1450,dist*2.15));
    if(dist<5){place(to.left,to.top,!!save);if(done)done();return;}
    moving=true;pet.classList.add('fePetRun');setState(dx>=0?'right':'left',true);
    var begun=performance.now();
    function step(now){
      if(!moving)return;
      var t=Math.min(1,(now-begun)/duration);
      var eased=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
      place(from.left+dx*eased,from.top+dy*eased,false);
      if(t<1)moveRaf=requestAnimationFrame(step);
      else{
        moveRaf=0;moving=false;pet.classList.remove('fePetRun');place(to.left,to.top,!!save);
        if(done)done();
      }
    }
    moveRaf=requestAnimationFrame(step);
  }

  function progressTarget(){
    var bar=narr.querySelector('.genBar'),r=bar&&bar.getBoundingClientRect();
    if(!r)return null;
    return {left:r.left+Math.min(92,r.width*.2)-pet.offsetWidth*.5,
            top:r.top-pet.offsetHeight+22};
  }

  function lowerRightTarget(){
    return {left:innerWidth-pet.offsetWidth-8,
            top:innerHeight-pet.offsetHeight-92};
  }

  function homeTarget(){
    var target=returnToTopLeft
      ?{left:8,top:52}
      :lowerRightTarget();
    returnToTopLeft=!returnToTopLeft;
    return target;
  }

  function resetGameRoute(){
    returnToTopLeft=true;
    var target=lowerRightTarget();
    place(target.left,target.top,false);
  }

  function openingTarget(){
    return lowerRightTarget();
  }

  function pinOpeningPet(){
    var target=openingTarget();
    place(target.left,target.top,false);
  }

  function stopOpeningTyping(){
    if(openingTypingTimer){clearTimeout(openingTypingTimer);openingTypingTimer=0;}
  }

  function writing(){
    if(surface!=='opening'&&surface!=='game')return;
    stopOpeningTyping();
    if(state!=='review'||!timer)setState('review',true);
    openingTypingTimer=setTimeout(function(){
      openingTypingTimer=0;
      if(surface==='opening')setState('idle',true);
      else if(surface==='game'&&jobPhase==='idle'&&!moving)setState('idle',true);
    },850);
  }

  function isWritingField(el){
    if(!el)return false;
    var tag=(el.tagName||'').toLowerCase();
    return tag==='input'||tag==='textarea'||el.isContentEditable;
  }

  function isActiveWritingField(el){
    return (surface==='opening'&&isWritingField(el))||(surface==='game'&&el===gameInput);
  }

  function nearGameInput(clientX,clientY,target){
    if(surface!=='game'||!gameInput)return false;
    var line=gameInput.closest('.gInput');
    if(target===gameInput||(target&&target.closest&&target.closest('.gInput')===line))return true;
    if(!line)return false;
    var r=line.getBoundingClientRect();
    return clientX>=r.left-32&&clientX<=r.right+32&&clientY>=r.top-88&&clientY<=r.bottom+28;
  }

  function beginDelivery(){
    if(deliveryTimer){clearTimeout(deliveryTimer);deliveryTimer=0;}
    jobPhase='waiting';tokenWas=false;
    var target=progressTarget();
    if(!target){setTimeout(function(){if(jobPhase==='waiting')beginDelivery();},40);return;}
    moveTo(target.left,target.top,function(){
      if(jobPhase==='streaming')performDelivery();
      else if(jobPhase==='waiting')setState('running',true);
    },false);
  }

  function firstToken(){
    jobPhase='streaming';
    if(!moving)performDelivery();
  }

  function performDelivery(){
    jobPhase='delivering';setState('delivering',true);
    if(deliveryTimer)clearTimeout(deliveryTimer);
    deliveryTimer=setTimeout(function(){deliveryTimer=0;finishDelivery();},1080);
  }

  function finishDelivery(){
    if(jobPhase==='returning'||jobPhase==='idle')return;
    jobPhase='returning';
    var target=homeTarget();
    moveTo(target.left,target.top,function(){jobPhase='idle';setState('idle',true);},true);
  }

  function stopRoam(){
    if(roamTimer){clearTimeout(roamTimer);roamTimer=0;}
  }

  function stopMenuWaveClock(){
    if(menuWaveTimer){clearInterval(menuWaveTimer);menuWaveTimer=0;}
    menuWaveDue=false;
  }

  function menuWave(){
    if(surface!=='menu')return;
    menuWaveDue=true;
    if(moving||dragging)return;
    menuWaveDue=false;stopRoam();setState('idle',true);queueRoam(1500);
  }

  function startMenuWaveClock(){
    stopMenuWaveClock();
    menuWaveTimer=setInterval(menuWave,60000);
  }

  function queueRoam(delay){
    stopRoam();
    roamTimer=setTimeout(roamOnce,delay==null?(700+Math.random()*1500):delay);
  }

  function menuLookAround(){
    stopAnimation();state='lookaround';frame=0;draw(9,0);
    timer=setInterval(function(){
      frame++;
      if(frame>=16){clearInterval(timer);timer=0;setState('waiting',true);return;}
      draw(frame<8?9:10,frame<8?frame:frame-8);
    },174*MENU_STOP_ACTION_SLOWDOWN);
  }

  function playMenuAction(){
    var actions=[
      {name:'waiting',dwell:1900},
      {name:'running',dwell:2100},
      {name:'review',dwell:1800},
      {name:'waving',dwell:1450},
      {name:'jumping',dwell:1250},
      {name:'failed',dwell:2350},
      {name:'lookaround',dwell:2250}
    ];
    var action=actions[menuActionIndex%actions.length];menuActionIndex++;
    if(action.name==='lookaround')menuLookAround();
    else setState(action.name,true);
    var delay;
    if(action.name==='lookaround')delay=16*174*MENU_STOP_ACTION_SLOWDOWN;
    else{
      var spec=STATES[action.name],pace=MENU_PACE*MENU_STOP_ACTION_SLOWDOWN;
      delay=spec.loop?action.dwell*pace:spec.frames*spec.ms*pace;
    }
    queueRoam(delay);
  }

  function roamOnce(){
    roamTimer=0;
    if(surface!=='menu'||jobPhase!=='idle'){return;}
    var pad=6,top=48,maxX=Math.max(pad,innerWidth-pet.offsetWidth-pad);
    var maxY=Math.max(top,innerHeight-pet.offsetHeight-pad),edge=Math.floor(Math.random()*4);
    var x,y;
    if(edge===0){x=pad;y=top+Math.random()*(maxY-top);}
    else if(edge===1){x=maxX;y=top+Math.random()*(maxY-top);}
    else if(edge===2){x=pad+Math.random()*(maxX-pad);y=top;}
    else{x=pad+Math.random()*(maxX-pad);y=maxY;}
    moveTo(x,y,function(){
      if(surface!=='menu')return;
      if(menuWaveDue){menuWaveDue=false;setState('idle',true);}
      else{playMenuAction();return;}
      queueRoam(2200);
    },false);
  }

  function stopGameActionClock(){
    if(gameActionTimer){clearTimeout(gameActionTimer);gameActionTimer=0;}
  }

  function queueGameAction(delay){
    stopGameActionClock();
    if(surface!=='game')return;
    gameActionTimer=setTimeout(playGameIdleAction,delay==null?(25000+Math.random()*20000):delay);
  }

  function playGameIdleAction(){
    gameActionTimer=0;
    if(surface!=='game')return;
    /* 不抢玩家输入、鼠标注视、拖拽、移动与 AI 收发信状态。 */
    if(jobPhase!=='idle'||dragging||moving||state!=='idle'){
      queueGameAction(7000+Math.random()*7000);
      return;
    }
    var actions=['waving','review','jumping','failed'];
    setState(actions[gameActionIndex%actions.length],true);
    gameActionIndex++;
    queueGameAction();
  }

  function syncGeneration(){
    var active=!!(window.GEN&&GEN.active&&GEN.mode==='gen');
    if(active&&!genWasActive)beginDelivery();
    if(active&&!tokenWas&&GEN.chars>0){tokenWas=true;firstToken();}
    if(!active&&genWasActive&&jobPhase==='waiting'){
      jobPhase='failed';setState('failed',true);
      setTimeout(finishDelivery,1050);
    }
    genWasActive=active;
  }

  function pointerDown(e){
    if(e.button!=null&&e.button!==0)return;
    if(jobPhase!=='idle'||moving)return;
    if(surface==='menu')stopRoam();
    dragging=true;moved=false;startX=e.clientX;startY=e.clientY;lastX=e.clientX;
    var r=pet.getBoundingClientRect();startL=r.left;startT=r.top;
    pet.classList.add('fePetDrag');
    try{sprite.setPointerCapture(e.pointerId);}catch(_){}
    e.preventDefault();
  }

  function pointerMove(e){
    if(!dragging)return;
    var dx=e.clientX-startX,dy=e.clientY-startY;
    if(Math.abs(dx)+Math.abs(dy)>5&&!moved){moved=true;pet.classList.add('fePetMove');}
    if(moved){
      place(startL+dx,startT+dy,false);
      if(Math.abs(e.clientX-lastX)>1)setState(e.clientX>lastX?'right':'left');
      lastX=e.clientX;
    }
    e.preventDefault();
  }

  function pointerUp(e){
    if(!dragging)return;
    dragging=false;pet.classList.remove('fePetDrag','fePetMove');
    try{sprite.releasePointerCapture(e.pointerId);}catch(_){}
    if(moved){var r=pet.getBoundingClientRect();place(r.left,r.top,true);setState(restState(),true);}
    else setState('waving',true);
    if(surface==='menu')queueRoam();
    e.preventDefault();
  }

  function syncVisibility(){
    var gameOn=!!(game&&game.classList.contains('show'));
    var openingOn=!!((eraSel&&eraSel.classList.contains('on'))||(opening&&opening.classList.contains('on')));
    var menuOn=!!(menu&&menu.classList.contains('show')&&!menu.classList.contains('era')&&!menu.classList.contains('gbg'));
    var next=gameOn?'game':(openingOn?'opening':(menuOn?'menu':'none')),on=next!=='none';
    var changed=next!==surface;
    if(changed){
      surface=next;stopRoam();stopMenuWaveClock();stopGameActionClock();stopOpeningTyping();cancelMove();
      if(next==='game'){resetGameRoute();gameActionIndex=0;queueGameAction(18000+Math.random()*9000);}
      if(next==='menu'){menuActionIndex=0;startMenuWaveClock();queueRoam(260);}
      if(next==='opening')pinOpeningPet();
    }
    pet.classList.toggle('fePetOn',on);
    pet.setAttribute('aria-hidden',on?'false':'true');
    if(changed&&on)setState(jobPhase==='streaming'?'delivering':(jobPhase==='idle'?restState():'running'),true);
    else if(on&&!timer&&state!=='look')setState(jobPhase==='streaming'?'delivering':(jobPhase==='idle'?restState():'running'),true);
    else if(!on)stopAnimation();
  }

  function init(){
    game=document.getElementById('game');menu=document.getElementById('menu');narr=document.getElementById('gNarr');
    gameInput=document.getElementById('gIn');
    eraSel=document.getElementById('eraSel');opening=document.getElementById('feWrap');
    if(!game||!menu||!narr)return;
    pet=document.createElement('div');pet.id='fePet';pet.setAttribute('aria-label','屋脊急件员桌宠');pet.setAttribute('aria-hidden','true');
    sprite=document.createElement('div');sprite.id='fePetSprite';sprite.setAttribute('role','button');sprite.setAttribute('tabindex','0');sprite.setAttribute('title','拖动她移动 · 点击挥手 · 双击跳起');
    pet.appendChild(sprite);document.body.appendChild(pet);
    restore();setState('idle',true);syncVisibility();

    sprite.addEventListener('pointerdown',pointerDown);
    sprite.addEventListener('pointermove',pointerMove);
    sprite.addEventListener('pointerup',pointerUp);
    sprite.addEventListener('pointercancel',pointerUp);
    sprite.addEventListener('dblclick',function(e){if(surface!=='opening')setState('jumping',true);e.preventDefault();});
    sprite.addEventListener('keydown',function(e){if(surface!=='opening'&&(e.key==='Enter'||e.key===' ')){setState('waving',true);e.preventDefault();}});
    document.addEventListener('pointermove',function(e){if(e.pointerType!=='touch'&&!dragging)lookAt(e.clientX,e.clientY,e.target);},{passive:true});
    document.addEventListener('keydown',function(e){
      if(!isActiveWritingField(e.target)||e.metaKey||e.ctrlKey||e.altKey)return;
      if(e.key.length===1||e.key==='Backspace'||e.key==='Delete'||e.key==='Enter')writing();
    },true);
    document.addEventListener('beforeinput',function(e){if(isActiveWritingField(e.target))writing();},true);
    document.addEventListener('compositionstart',function(e){if(isActiveWritingField(e.target))writing();},true);
    document.addEventListener('compositionupdate',function(e){if(isActiveWritingField(e.target))writing();},true);
    document.addEventListener('input',function(e){if(isActiveWritingField(e.target))writing();},true);
    addEventListener('resize',function(){
      if(surface==='opening')pinOpeningPet();
      else{var r=pet.getBoundingClientRect();place(r.left,r.top,false);}
    });

    new MutationObserver(syncVisibility).observe(game,{attributes:true,attributeFilter:['class']});
    new MutationObserver(syncVisibility).observe(menu,{attributes:true,attributeFilter:['class']});
    if(eraSel)new MutationObserver(syncVisibility).observe(eraSel,{attributes:true,attributeFilter:['class']});
    if(opening)new MutationObserver(syncVisibility).observe(opening,{attributes:true,attributeFilter:['class','data-step']});
    setInterval(syncGeneration,80);

    window.FeliniaPet={
      setState:function(name){setState(name,true);},
      fail:function(){setState('failed',true);},
      wait:function(){setState('waiting',true);},
      resetPosition:function(){try{localStorage.removeItem(STORE);}catch(_){}restore();}
    };
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
