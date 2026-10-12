import assert from 'node:assert/strict';
import { Matrix4, Vector3, Quaternion } from 'three';
import { PoseStabilizer } from '../src/pose-stabilizer.ts';

const pose = (x, angle, scale=1) => new Matrix4().compose(new Vector3(x,0,-3),new Quaternion().setFromAxisAngle(new Vector3(0,1,0),angle),new Vector3(scale,scale,scale));
const filter = new PoseStabilizer();
const close = (a,b) => a.elements.every((v,i) => Math.abs(v-b.elements[i]) < 1e-10);
assert.ok(close(filter.update(pose(1,.1),0),pose(1,.1)), 'First acquisition snaps to its actual pose');
filter.reset();
assert.ok(close(filter.update(pose(-1,-.1),100),pose(-1,-.1)), 'Reacquisition must not interpolate from the lost pose');

const position = new Vector3(), rotation = new Quaternion(), scale = new Vector3();
let rawEnergy=0, smoothEnergy=0, rawTurnEnergy=0, smoothTurnEnergy=0;
filter.reset();
for(let i=0;i<240;i++) {
  const x=.009*Math.sin(i*1.8), angle=.03*Math.sin(i*1.5);
  filter.update(pose(x,angle,1+.01*Math.sin(i*1.7)),i*1000/60).decompose(position,rotation,scale);
  if(i>30) {rawEnergy+=x*x;smoothEnergy+=position.x**2;rawTurnEnergy+=angle*angle;smoothTurnEnergy+=rotation.angleTo(new Quaternion())**2;}
  assert.ok(Math.abs(scale.x-scale.y)<1e-8 && Math.abs(scale.y-scale.z)<1e-8,'Pose remains rigid, without shear');
}
const translationRatio=Math.sqrt(smoothEnergy/rawEnergy), rotationRatio=Math.sqrt(smoothTurnEnergy/rawTurnEnergy);
assert.ok(translationRatio<.6 && rotationRatio<.6,'Suppress injected stationary jitter');
filter.reset();filter.update(pose(0,0),0);
for(let i=1;i<=18;i++)filter.update(pose(.2,.3),i*1000/60).decompose(position,rotation,scale);
assert.ok(position.x>.18 && rotation.angleTo(new Quaternion().setFromAxisAngle(new Vector3(0,1,0),.3))<.04,'Follow deliberate movement within 300 ms');
console.log(JSON.stringify({translationJitterRatio:translationRatio,rotationJitterRatio:rotationRatio,rigidPose:true,reacquisition:true,movementResponse:true}));
