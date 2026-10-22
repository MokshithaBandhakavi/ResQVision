const COLORS = { bg: 0x19292d, grid: 0x293b3e, road: 0x2d4043, roadEdge: 0x3b5051, building: 0x445557, buildingDark: 0x354649, rubble: 0x8c7357, green: 0xc6f36b, red: 0xff725e, amber: 0xffbf69, text: 0xb5c0b8 };

export class RescueScene extends Phaser.Scene {
  constructor(callbacks) { super('RescueScene'); this.callbacks = callbacks; }

  create() {
    this.graphics = this.add.graphics();
    this.cursorGraphics = this.add.graphics().setDepth(10);
    this.drawMap();
    this.objects = [
      { type: 'victim', x: 0.28, y: 0.52, rescued: false, selected: false, id: 1 },
      { type: 'victim', x: 0.75, y: 0.31, rescued: false, selected: false, id: 2 },
      { type: 'victim', x: 0.80, y: 0.78, rescued: false, selected: false, id: 3 },
      { type: 'debris', x: 0.47, y: 0.56, cleared: false, id: 1 },
      { type: 'fire', x: 0.53, y: 0.80, cleared: false, id: 1 },
      { type: 'debris', x: 0.39, y: 0.28, cleared: false, id: 2 },
    ];
    this.drawObjects();
    this.input.on('pointerdown', (pointer) => this.handleClick(pointer));
    this.scale.on('resize', () => { this.drawMap(); this.drawObjects(); });
  }

  drawMap() {
    const g = this.graphics; const w = this.scale.width; const h = this.scale.height;
    g.clear(); g.fillStyle(COLORS.bg, 1); g.fillRect(0, 0, w, h);
    g.lineStyle(1, COLORS.grid, 0.65);
    for (let x = 0; x < w; x += 32) g.lineBetween(x, 0, x, h);
    for (let y = 0; y < h; y += 32) g.lineBetween(0, y, w, y);
    g.fillStyle(COLORS.road, 1); g.fillRect(0, h * .43, w, h * .13); g.fillRect(w * .43, 0, w * .13, h); g.fillRect(w * .10, h * .72, w * .46, h * .075);
    g.lineStyle(1, COLORS.roadEdge, 1); g.strokeRect(0, h * .43, w, h * .13); g.strokeRect(w * .43, 0, w * .13, h); g.strokeRect(w * .10, h * .72, w * .46, h * .075);
    const blocks = [[.08,.09,.25,.22],[.62,.08,.27,.22],[.20,.29,.18,.12],[.69,.54,.22,.19],[.08,.68,.20,.20],[.59,.79,.27,.15]];
    blocks.forEach(([x,y,bw,bh], i) => {
      g.fillStyle(i === 2 || i === 4 ? 0x494337 : COLORS.building, 1); g.fillRect(w*x+4,h*y+5,w*bw,h*bh);
      g.lineStyle(2, i === 2 || i === 4 ? COLORS.rubble : 0x62716c, 1); g.strokeRect(w*x+4,h*y+5,w*bw,h*bh);
      g.lineStyle(1, 0x71807a, .45);
      for(let yy=h*y+14; yy<h*(y+bh)-5; yy+=15) for(let xx=w*x+14; xx<w*(x+bw)-5; xx+=18) g.strokeRect(xx,yy,7,7);
      if(i===2||i===4){g.lineStyle(3,COLORS.rubble,.85);g.lineBetween(w*x+10,h*y+9,w*(x+bw)-5,h*(y+bh)-5);g.lineBetween(w*(x+bw)-7,h*y+13,w*x+8,h*(y+bh)-7);}
    });
    g.fillStyle(0xc6f36b,.07);g.fillCircle(w*.49,h*.49,Math.min(w,h)*.31);g.lineStyle(1,COLORS.green,.14);g.strokeCircle(w*.49,h*.49,Math.min(w,h)*.31);
    g.fillStyle(0xe3e9df,1);g.fillCircle(w*.49,h*.49,7);g.lineStyle(2,COLORS.bg,1);g.strokeCircle(w*.49,h*.49,7);
    g.lineStyle(1,COLORS.green,.3);g.lineBetween(w*.49,h*.49,w*.56,h*.36);g.lineBetween(w*.49,h*.49,w*.36,h*.60);
  }

  drawObjects() {
    if (!this.objects) return;
    const g = this.graphics; const w=this.scale.width,h=this.scale.height;
    this.objects.forEach((o) => {
      const x=o.x*w,y=o.y*h;
      if(o.type==='victim' && !o.rescued){g.fillStyle(o.selected?0xffffff:COLORS.green,.17);g.fillCircle(x,y,19);g.fillStyle(o.selected?0xffffff:COLORS.green,1);g.fillCircle(x,y,11);g.lineStyle(2,COLORS.bg,1);g.strokeCircle(x,y,11);g.lineStyle(2,COLORS.bg,1);g.lineBetween(x-5,y,x+5,y);g.lineBetween(x,y-5,x,y+5);}
      if(o.type!=='victim' && !o.cleared){
        if(o.type==='fire'){g.fillStyle(COLORS.red,.12);g.fillCircle(x,y,22);g.fillStyle(COLORS.red,1);g.fillTriangle(x,y-14,x-9,y+8,x+9,y+8);g.fillStyle(COLORS.amber,1);g.fillTriangle(x,y-7,x-4,y+5,x+4,y+5);}
        else {g.fillStyle(COLORS.amber,.16);g.fillCircle(x,y,20);g.fillStyle(COLORS.rubble,1);g.fillPoints([{x:x-9,y:y+4},{x:x-4,y:y-7},{x:x+3,y:y-4},{x:x+9,y:y+5},{x:x+2,y:y+9}],true);g.lineStyle(1,COLORS.amber,1);g.strokePoints([{x:x-9,y:y+4},{x:x-4,y:y-7},{x:x+3,y:y-4},{x:x+9,y:y+5},{x:x+2,y:y+9}],true);}
      }
    });
  }

  handleClick(pointer) {
    const x=pointer.x/this.scale.width,y=pointer.y/this.scale.height;
    const hit=this.objects.find(o=>Math.hypot(o.x-x,o.y-y)<.065 && (o.type==='victim'?!o.rescued:!o.cleared));
    if(!hit){this.callbacks.status('Click a survivor or a highlighted hazard.');return;}
    if(hit.type==='victim'){
      const blocked=this.objects.find(o=>o.type!=='victim'&&!o.cleared&&Math.hypot(o.x-hit.x,o.y-hit.y)<.31);
      if(hit.selected){if(blocked){this.callbacks.status(`Route blocked by ${blocked.type}. Clear it first.`);return;}hit.rescued=true;hit.selected=false;this.callbacks.rescue();}
      else {this.objects.forEach(o=>{if(o.type==='victim')o.selected=false;});hit.selected=true;this.callbacks.status(`Survivor ${hit.id} located. Click again to attempt rescue.`);}
    } else {hit.cleared=true;this.callbacks.clear(hit.type);}
    this.drawObjects();
  }

  handleGestureClick(x, y) { this.handleClick({ x: x * this.scale.width, y: y * this.scale.height }); }

  setGestureCursor(x, y, pinching) {
    this.cursorGraphics.clear();
    const px=x*this.scale.width, py=y*this.scale.height;
    this.cursorGraphics.lineStyle(2,pinching?COLORS.amber:COLORS.green,1);
    this.cursorGraphics.strokeCircle(px,py,pinching?13:10);
    this.cursorGraphics.lineBetween(px-16,py,px-7,py); this.cursorGraphics.lineBetween(px+7,py,px+16,py);
    this.cursorGraphics.lineBetween(px,py-16,px,py-7); this.cursorGraphics.lineBetween(px,py+7,px,py+16);
  }
}
