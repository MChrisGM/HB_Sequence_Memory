let canvas;

const COMP = 'computer';
const PLAYER = 'player';
const MENU = 'menu';
const PLAYING = 'playing';
const FINISHED = 'finished';

const palette = {
  480: {
    BACKGROUND: "#343631",
    BTN: "#366a82",
    CLICK: "#89d0ee",
    HIGHLIGHT: "#926f47",
    TEXT: "#ddf3fe",
  },
  4240:{
    BACKGROUND: "#111b1e",
    BTN: "#2f4c58",
    HIGHLIGHT: "#63a583",
    CLICK: "#6e93d6",
    TEXT: "#e4dbd9",
  },
  4567:{
    BACKGROUND: "#02315E",
    BTN: "#00457E",
    CLICK: "#2F70AF",
    HIGHLIGHT: "#806491",
    TEXT: "#B9848C",
  },
  4542:{
    BACKGROUND: "#0C151C",
    BTN: "#16354D",
    HIGHLIGHT: "#6B99C3",
    CLICK: "#D2D2D4",
    TEXT: "#E4E5EA",
  },
  4558:{
    BACKGROUND: "#513C2F",
    BTN: "#5A7A0A",
    HIGHLIGHT: "#83D350",
    CLICK: "#FAB036",
    TEXT: "#FDD48A",
  },
  4570:{
    BACKGROUND: "#212517",
    CLICK: "#DED3A6",
    HIGHLIGHT: "#759242",
    BTN: "#374709",
    TEXT: "#F2F2EF",
  },
  4564:{
    BACKGROUND: "#680003",
    CLICK: "#F5704A",
    BTN: "#BC0000",
    HIGHLIGHT: "#828D00",
    TEXT: "#EFB9AD",
  },
  4562:{
    BACKGROUND: "#2D4628",
    CLICK: "#FFA570",
    BTN: "#E83100",
    HIGHLIGHT: "#FF6933",
    TEXT: "#FAD074",
  },
  4556:{
    BACKGROUND: "#100102",
    CLICK: "#EA592A",
    BTN: "#4B1E19",
    HIGHLIGHT: "#C0587E",
    TEXT: "#FC8B5E",
  },
  328: {
    BACKGROUND: "#1f1d22",
    CLICK: "#f49b0d",
    BTN: "#554b54",
    HIGHLIGHT: "#cf5fa9",
    TEXT: "#baa6a7",
  },
  1195:{
    BACKGROUND: "#020A12",
    CLICK: "#075B7B",
    BTN: "#002E3F",
    HIGHLIGHT: "#501B2D",
    TEXT: "#F6386D",
  },
  4549:{
    BACKGROUND: "#081012",
    HIGHLIGHT: "#E0AB9A",
    BTN: "#4D8FC3",
    CLICK: "#EF8A84",
    TEXT: "#FFF3EB",
  },
}
var COLOR = palette[4549];

class Button{
  constructor(args, caller){

    let id = args.id || 0;
    let txt = args.txt || '';
    let txtSize = args.txtSize || 20;
    let pos = args.pos || {x:0,y:0};
    let size = args.size || {x:10,y:10};
    let shape = args.shape || rect;
    let tcolor = args.tcolor || color(255,255,255);
    let scolor = args.color || color(0,0,0);
    let callback = args.callback || function(){};
    
    rectMode(CENTER);
    fill(scolor);
    shape(pos.x,pos.y,size.x,size.y);
    
    fill(tcolor);
    textAlign(CENTER);
    textSize(txtSize);
    text(txt,pos.x,pos.y+Math.floor(txtSize/2)-3);
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
    this.rows = y || 3;
    this.cols = x || 3;
    this.sq = this.cols*this.rows;
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
      player_completed: true,
      seq_playing: true,      
      seq_index: 0,
      seq_length: 0,
      seq_lastDisplay: 0,
      seq_holdTime: 500,
      seq_inBetweenTime: 600,
      seq_startAfterMenuTime: 300,
      seq_startAfterSequenceTime: 500,
      btn_debounce: 200,
    };
    this.button_status = [];
    for(let i=0;i<this.sq;i++){
      this.button_status.push({clicked: false, last_clicked: 0});
    }
  }
  
  menu(self){
    document.getElementById("memorize").className = "";
    document.getElementById("repeat").className = "";
    noFill();
    stroke(255);
    strokeWeight(3);
    rectMode(CENTER);
    // rect(width/2,height/2,width,height);
    strokeWeight(0.5);
    stroke(0);
    new Button({txt:'Start',
                txtSize:width/20,
                tcolor:color(COLOR.TEXT),
                size:{x:width*0.2,y:height*0.1},
                callback: function(id, caller, timestamp){
                  for(let i=0;i<self.sq;i++){
                    self.button_status[i].last_clicked=timestamp-900;
                  }
                  self.onSequenceData.seq_lastDisplay = timestamp+2000;
                  self.start();
                }, 
                color:color(COLOR.BTN),
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
    if(document.getElementById("repeat").className == "highlight-container"){
      if(Date.now() - self.onSequenceData.seq_lastDisplay > self.onSequenceData.seq_startAfterMenuTime){
        document.getElementById("memorize").className = "highlight-container";
        document.getElementById("repeat").className = "";
      }
    }else{
      document.getElementById("memorize").className = "highlight-container";
      document.getElementById("repeat").className = "";
    }
    if(self.onSequenceData.player_completed){
      self.sequence.push(getRandomInt(self.sq));
      self.onSequenceData.seq_length++;
      self.onSequenceData.player_completed = false;
    }
    self.onSequenceData.seq_playing = true;
    let idx = self.onSequenceData.seq_index;
    let len = self.onSequenceData.seq_length;
    let last = self.onSequenceData.seq_lastDisplay;
    let delay = self.onSequenceData.seq_holdTime;
    let playTime = self.onSequenceData.seq_inBetweenTime;
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
    document.getElementById("memorize").className = "";
    document.getElementById("repeat").className = "highlight-container";
    if(!areEqual(this.sequence, this.player_sequence)){
      this.stop();
    }else{
      if(exactlyEqual(this.sequence, this.player_sequence)){
        self.sequence_turn = COMP;
        self.onSequenceData.player_completed = true;
        self.onSequenceData.seq_index = 0;
        self.player_sequence = [];
        self.onSequenceData.seq_lastDisplay = Date.now()+self.onSequenceData.seq_startAfterSequenceTime;
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

      if (Date.now() - self.button_status[i].last_clicked > self.onSequenceData.seq_holdTime){
        self.button_status[i].clicked = false;
      }else{
        self.button_status[i].clicked = true;
      }

      let c = color(COLOR.BTN);
      if(self.button_status[i].clicked){
        c = color(COLOR.CLICK);
      }
      
      new Button({
                id: i,
                size:{x:(width/self.cols)-(width/(100*self.cols)),y:(height/self.rows)-(height/(100*self.rows))},
                tcolor:color(COLOR.TEXT),
                callback: function(id, caller, timestamp){
                  if(!self.onSequenceData.seq_playing){
                    if(!self.button_status[i].clicked){
                      if(timestamp - self.button_status[i].last_clicked > self.onSequenceData.btn_debounce){
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
    let txtSize = 3*width/20;
    textSize(txtSize);
    fill(color(COLOR.TEXT));
    stroke(0);
    text(self.score,width/2,(height/2)+txtSize/2);
    
  }
  
  finished(self){
    new Button({txt:'Play Again',
                txtSize:width/20,
                tcolor:color(COLOR.TEXT),
                size:{x:width*0.3,y:height*0.1},
                callback: function(id, caller, timestamp){
                  game = new Game();
                }, 
                color: color(COLOR.BTN),
                pos: {x:width/2,y:height/2}
               },self);
    
    textAlign(CENTER);
    textSize(1.5*width/20);
    fill(255);
    text("Your score: "+self.score,width/2,(height/3)+15);
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

let game = new Game(3, 3);

function setup(){
  let c_size = returnSize();
  canvas = createCanvas(c_size, c_size);
  canvas.parent('canvas_holder');
  document.querySelector(':root').style.setProperty('--highlight', color(COLOR.HIGHLIGHT).toString('#rrggbb'));
  document.querySelector(':root').style.setProperty('--background', color(COLOR.BACKGROUND).toString('#rrggbb'));
}

function draw(){
  background(color(COLOR.BACKGROUND));
  document.querySelector(':root').style.setProperty('--highlight', color(COLOR.HIGHLIGHT).toString('#rrggbb'));
  document.querySelector(':root').style.setProperty('--background', color(COLOR.BACKGROUND).toString('#rrggbb'));
  game.loop();
}

function windowResized(){
  let c_size = returnSize();
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

const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

function objRGB(obj){
  return color(obj.r,obj.g,obj.b);
}

function returnSize(){
  let scale = 1.8;
  if(isMobile()){
      scale = 1.2;
  }
  let c_size = 0;
  if(windowWidth>windowHeight){
    c_size = windowHeight/scale;
  }else{
    c_size = windowWidth/scale;
  }
  return c_size;
}
