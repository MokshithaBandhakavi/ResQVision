const VISION_MODULE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
const WASM_PATH = `${VISION_MODULE}/wasm`;
const MODEL_PATH = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export class HandTracking {
  constructor({ video, onPoint, onPinch, onStatus }) {
    this.video=video;this.onPoint=onPoint;this.onPinch=onPinch;this.onStatus=onStatus;
    this.running=false;this.pinched=false;this.lastPinchAt=0;this.lastVideoTime=-1;
  }
  async start() {
    if(!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access needs HTTPS or localhost in a supported browser.');
    this.onStatus('Requesting camera access…');
    this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});
    this.video.srcObject=this.stream;await this.video.play();
    this.onStatus('Loading hand tracking model…');
    const {FilesetResolver,HandLandmarker}=await import(`${VISION_MODULE}/vision_bundle.mjs`);
    const vision=await FilesetResolver.forVisionTasks(WASM_PATH);
    const options={baseOptions:{modelAssetPath:MODEL_PATH},runningMode:'VIDEO',numHands:1,minHandDetectionConfidence:.55,minHandPresenceConfidence:.5,minTrackingConfidence:.5};
    try{this.landmarker=await HandLandmarker.createFromOptions(vision,{...options,baseOptions:{...options.baseOptions,delegate:'GPU'}});}
    catch{this.landmarker=await HandLandmarker.createFromOptions(vision,options);}
    this.running=true;this.onStatus('Camera ready · show one hand');this.loop();
  }
  loop() {
    if(!this.running)return;
    if(this.video.readyState>=2&&this.video.currentTime!==this.lastVideoTime){
      this.lastVideoTime=this.video.currentTime;
      const result=this.landmarker.detectForVideo(this.video,performance.now());
      const hand=result.landmarks?.[0];
      if(hand){
        // The preview is mirrored, so invert x to make the game cursor feel natural.
        const x=1-hand[8].x,y=hand[8].y;
        const distance=Math.hypot(hand[4].x-hand[8].x,hand[4].y-hand[8].y);
        const pinching=distance<.055;
        this.onPoint(x,y,pinching);
        if(pinching&&!this.pinched&&performance.now()-this.lastPinchAt>450){this.lastPinchAt=performance.now();this.onPinch(x,y);}
        this.pinched=pinching;
      } else {this.pinched=false;this.onStatus('Show one hand to the camera');}
    }
    this.frame=requestAnimationFrame(()=>this.loop());
  }
  stop() {
    this.running=false;if(this.frame)cancelAnimationFrame(this.frame);
    this.landmarker?.close();this.landmarker=null;
    this.stream?.getTracks().forEach(track=>track.stop());this.stream=null;
    this.video.srcObject=null;this.pinched=false;
  }
}
