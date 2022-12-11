let canvas;

const COMP = 'computer';
const PLAYER = 'player';
const MENU = 'menu';
const PLAYING = 'playing';
const FINISHED = 'finished';

class Button{
  constructor(args, caller){

    let id = args.id || 0;
    let txt = args.txt || '';
    let txtSize = args.txtSize || 20;
    let pos = args.pos || {x:0,y:0};
    let size = args.size || {x:10,y:10};
    let shape = args.shape || rect;
    let tcolor = args.tcolor || {r:255,g:255,b:255}
    let scolor = args.color || {r:0,g:0,b:0};
    let callback = args.callback || function(){};
    
    rectMode(CENTER);
    fill(scolor.r,scolor.g,scolor.b);
    shape(pos.x,pos.y,size.x,size.y);
    
    fill(tcolor.r,tcolor.g,tcolor.b);
    textAlign(CENTER);
    textSize(txtSize);
    text(txt,pos.x,pos.y+txtSize/2);
    if(mouseX > pos.x - size.x/2 && mouseX < pos.x+size.x/2){
      if(mouseY > pos.y - size.y/2 && mouseY < pos.y+size.y/2){
        if(mouseIsPressed){
          callback(id, caller, Date.now());
        }
      }
    }
  }
}

class Game{
  constructor(x, y){
    this.sq = x*y;
    this.rows = y;
    this.cols = x;
    this.score = 1;
    this.current_mode = MENU;
    this.modes = {
      [MENU] : this.menu,
      [PLAYING] : this.playing,
      [FINISHED] : this.finished
    }
    this.sequence = [];
    this.player_sequence = [];
    this.sequence_turn = COMP;
    this.onSequenceData = {
      seq_playing: true,
      seq_index: 0,
      seq_length: 0,
      seq_lastDisplay: 0,
      seq_delay: 500,
      seq_playTime:1000,
      player_completed: true,
    };
    this.button_status = [];
    for(let i=0;i<this.sq;i++){
      this.button_status.push({clicked: false, last_clicked: 0});
    }
  }
  
  menu(self){
    new Button({txt:'Start',
                size:{x:width*0.2,y:height*0.1},
                callback: function(id, caller, timestamp){
                  for(let i=0;i<self.sq;i++){
                    self.button_status[i].last_clicked=timestamp-900;
                  }
                  self.onSequenceData.seq_lastDisplay = timestamp;
                  self.start();
                }, 
                color:{r:3, g:169, b:252},
                pos: {x:width/2,y:height/2}
               },self);
  }

  click(x, y){
    if(x>=0 && y>=0){
      this.button_status[(y*this.rows)+x].last_clicked=Date.now();
    }else if (x>=0){
      this.button_status[x].last_clicked=Date.now();
    }
  }
  
  playing_sequence(self){
    if(self.onSequenceData.player_completed){
      self.sequence.push(getRandomInt(self.sq));
      self.onSequenceData.seq_length++;
      self.onSequenceData.player_completed = false;
    }
    self.onSequenceData.seq_playing = true;
    let idx = self.onSequenceData.seq_index;
    let len = self.onSequenceData.seq_length;
    let last = self.onSequenceData.seq_lastDisplay;
    let delay = self.onSequenceData.seq_delay;
    let playTime = self.onSequenceData.seq_playTime;
    if(Date.now() - last > playTime){
      if(len-1 >= idx){
        this.click(self.sequence[idx]);
        self.onSequenceData.seq_index++;
        self.onSequenceData.seq_lastDisplay = Date.now();
      }else{
        self.sequence_turn = PLAYER;
      }
    }
  }
  
  playing_player(self){
    if(!areEqual(this.sequence, this.player_sequence)){
      this.stop();
    }else{
      if(exactlyEqual(this.sequence, this.player_sequence)){
        self.sequence_turn = COMP;
        self.onSequenceData.player_completed = true;
        self.onSequenceData.seq_index = 0;
        self.player_sequence = [];
        self.onSequenceData.seq_lastDisplay = Date.now()+750;
        self.score++;
      }
    }
    if(this.player_sequence.length > this.sequence.length){
      this.stop();
    }
    this.onSequenceData.seq_playing = false;
  }
  
  playing(self){
    switch(self.sequence_turn){
      case COMP:
        self.playing_sequence(self);
        break;
      case PLAYER:
        self.playing_player(self);
        break;
      default:
        break;
    }
    for(let i=0;i<self.sq;i++){
      let indx = i%self.cols;
      let indy = Math.floor(i/self.rows);

      if (Date.now() - self.button_status[i].last_clicked > self.onSequenceData.seq_delay){
        self.button_status[i].clicked = false;
      }else{
        self.button_status[i].clicked = true;
      }

      let c = {r:3, g:169, b:252};
      if(self.button_status[i].clicked){
        c = {r:255, g:255, b:255};
      }
      
      new Button({
                id: i,
                // txt:indx+","+indy,
                size:{x:(width/self.cols)-(width/(100*self.cols)),y:(height/self.rows)-(height/(100*self.rows))},
                callback: function(id, caller, timestamp){
                  if(!self.onSequenceData.seq_playing){
                    if(!self.button_status[i].clicked){
                      if(timestamp - self.button_status[i].last_clicked > 250){
                        console.log(id, timestamp);
                        self.button_status[i].last_clicked = timestamp;
                        self.button_status[i].clicked = true;
                        self.player_sequence.push(id);
                      }
                    }
                  }
                }, 
                color: c,
                pos: {x:(0.5+indx)*width/self.cols,y:(0.5+indy)*height/self.rows}
               },self);
    }

    textAlign(CENTER);
    textSize(30);
    fill(0);
    text(self.score,width/2,(height/2)+15);
    
  }
  
  finished(self){
    
  }
  
  start(){
    if(this.current_mode == MENU || this.current_mode == FINISHED){
      this.current_mode = PLAYING;
    }
  }
  
  stop(){
    if(this.current_mode == PLAYING){
      this.current_mode = FINISHED;
    }
  }
    
  run_mode(mode){
    this.modes[mode](this);
  }
  
  loop(){
    this.run_mode(this.current_mode);
  }
  
}

let game = new Game(8, 8);

function setup(){
  let c_size = 0;
  if(windowWidth>windowHeight){
    c_size = windowHeight/2;
  }else{
    c_size = windowWidth/2;
  }
  canvas = createCanvas(c_size, c_size);
  canvas.parent('canvas_holder');
}

function draw(){
  background(51);
  game.loop();
}

function windowResized(){
  let c_size = 0;
  if(windowWidth>windowHeight){
    c_size = windowHeight/2;
  }else{
    c_size = windowWidth/2;
  }
  resizeCanvas(c_size, c_size);
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function areEqual(array1, array2) {
  if(array1.length >= array2.length){
    for(let i=0;i<array2.length;i++){
      if(array1[i] != array2[i]){
        return false;
      }
    }
  }
  return true;
}

function exactlyEqual(array1, array2) {
  if (array1.length === array2.length) {
    return array1.every((element, index) => {
      if (element === array2[index]) {
        return true;
      }

      return false;
    });
  }

  return false;
}
