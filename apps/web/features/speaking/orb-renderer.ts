import { createOrbFluid } from "./orb-fluid";
import { simplex3d } from "./orb-simplex";

// Reference measurements and asset provenance: public/orb/README.md.
const vertex = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = vec2(.5-position.x*.5, position.y*.5+.5);
  gl_Position = vec4(position, 0., 1.);
}`;
const fragment = `
precision highp float;
varying vec2 vUv;
uniform sampler2D material;
uniform sampler2D fluid;
uniform float hasFluid;
uniform float time;
uniform float pixel;
uniform vec4 voice;
uniform vec4 microphone;
uniform vec4 history;
${simplex3d}
float random2(vec2 p) { return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453123); }
float valueNoise(vec2 p) {
  vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(random2(i),random2(i+vec2(1,0)),f.x),
             mix(random2(i+vec2(0,1)),random2(i+vec2(1)),f.x),f.y);
}
float fbm(vec2 p) {
  float sum=0., amplitude=.5;
  mat2 turn=mat2(cos(.5),sin(.5),-sin(.5),cos(.5));
  for(int i=0;i<4;i++) { sum+=amplitude*valueNoise(p); p=turn*p*2.+100.; amplitude*=.5; }
  return sum;
}
void main() {
  vec2 sphere=vec2(1.-vUv.x,vUv.y)*2.-1.;
  float radius=length(sphere);
  if(radius>1.) { gl_FragColor=vec4(0); return; }
  float depth=pow(sqrt(max(0.,1.-radius*radius)),1.1);
  vec2 uv=(sphere*.9/(depth+1.)+1.)*.5;
  // Fixed-rate ambient advection plus independently accumulated audio movement.
  vec2 p=uv*3.25;
  vec2 q=vec2(fbm(p),fbm(p+1.));
  float flow=time*2.25+history.x*.25;
  vec2 r=vec2(fbm(p+q+vec2(91.3,.55)+flow*.15),
              fbm(p+q-vec2(45.33,1.2)+flow*.126));
  float f=fbm(p+r);
  float fold=mix(.8,.66,clamp(f*f*2.75,0.,1.));
  fold=mix(fold,0.,clamp(length(q),0.,1.));
  fold=mix(fold,1.,clamp(abs(r.x),0.,1.));
  vec4 sound=max(voice,microphone);
  vec2 eddies=vec2(snoise(vec3(vUv*.65,time*.125+history.z*.1)),
                   snoise(vec3(vUv*.65+54.,time*.25)));
  uv+=sphere*(fold-.5)*.65+eddies*.15*(1.+sound.z*.25);
  vec3 flowField=texture2D(fluid,vUv).rgb*hasFluid;
  uv-=flowField.rg*.001;
  vec3 color=texture2D(material,uv).rgb;
  // Sound moves a highlight inside a stable circular silhouette. Input and
  // output push in opposite directions, without changing layout or audio gain.
  vec2 ring=(vUv-.5)*1.5;
  float angle=atan(ring.y,ring.x), distance=length(ring);
  float ringTime=-time*.5-history.w*.2;
  ring.x+=1.+voice.y*1.5-microphone.y*2.5;
  float n=snoise(vec3(ring*(.65+sound.x*.4),ringTime*.5))*.5+.5;
  float outer=1.-smoothstep(mix(.25,1.,n*.5),1.,distance);
  float inner=pow(smoothstep(.25,mix(.25,1.,n*.75),distance),2.);
  float light=(cos(angle+ringTime*2.)*.5+.5)*outer*inner;
  light=pow(light*min(1.,voice.w*4.+microphone.x*4.),3.);
  color=mix(color+light*.25,vec3(1),clamp(length(flowField)*.001,0.,1.))*1.15;
  gl_FragColor=vec4(clamp(color,0.,1.),1.-smoothstep(1.-pixel,1.,radius));
}`;

export type OrbRenderer = {
  flow: boolean;
  draw: (time: number, output: Float32Array, input: Float32Array, history: Float32Array, size: number) => void;
  dispose: () => void;
};
export function createOrbRenderer(canvas: HTMLCanvasElement, onReady: () => void): OrbRenderer | null {
  const gl=canvas.getContext("webgl", { alpha:true, antialias:false, depth:false, stencil:false, premultipliedAlpha:false, powerPreference:"low-power" });
  if(!gl) return null;
  const shaders: WebGLShader[]=[];
  let program: WebGLProgram | null=null, buffer: WebGLBuffer | null=null, texture: WebGLTexture | null=null;
  let disposed=false, loaded=false, previous=0;
  let flow: ReturnType<typeof createOrbFluid>=null;
  const bitmap=new Image();
  const dispose=()=>{ disposed=true; flow?.dispose(); bitmap.onload=null; bitmap.onerror=null; if(texture) gl.deleteTexture(texture); if(buffer) gl.deleteBuffer(buffer); if(program) gl.deleteProgram(program); shaders.forEach(s=>gl.deleteShader(s)); };
  try {
    for(const [kind,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]] as const) {
      const shader=gl.createShader(kind); if(!shader) throw new Error("Shader unavailable");
      shaders.push(shader); gl.shaderSource(shader,source); gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error("Shader compilation failed");
    }
    program=gl.createProgram(); if(!program) throw new Error("Program unavailable");
    shaders.forEach(s=>gl.attachShader(program!,s)); gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error("Shader linking failed");
    buffer=gl.createBuffer(); texture=gl.createTexture(); if(!buffer||!texture) throw new Error("GPU allocation unavailable");
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    gl.useProgram(program);
    const position=gl.getAttribLocation(program,"position"); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.uniform1i(gl.getUniformLocation(program,"material"),0);
    const clock=gl.getUniformLocation(program,"time"), pixel=gl.getUniformLocation(program,"pixel");
    const voice=gl.getUniformLocation(program,"voice"), microphone=gl.getUniformLocation(program,"microphone"), history=gl.getUniformLocation(program,"history");
    flow=createOrbFluid(gl);
    gl.useProgram(program);
    const fluid=gl.getUniformLocation(program,"fluid"), hasFluid=gl.getUniformLocation(program,"hasFluid");
    bitmap.onload=()=>{
      if(disposed||gl.isContextLost()) return;
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,texture); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,bitmap);
      loaded=true; onReady();
    };
    bitmap.src="/orb/blue-green.jpg";
    return {
      flow: !!flow,
      draw(time,output,input,cumulative,size) {
        if(!loaded||disposed||gl.isContextLost()) return;
        const dt=previous ? Math.min(.05,Math.max(0,(time-previous)/1.4)) : 0;previous=time;
        if(dt>0) flow?.step(output,input,dt);
        if(canvas.width!==size||canvas.height!==size) { canvas.width=size; canvas.height=size; }
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,size,size);
        gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
        gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
        gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,flow?.texture ?? texture);
        gl.uniform1i(fluid,1);gl.uniform1f(hasFluid,flow ? 1 : 0);
        gl.uniform1f(clock,time); gl.uniform1f(pixel,1/size);
        gl.uniform4fv(voice,output); gl.uniform4fv(microphone,input); gl.uniform4fv(history,cumulative);
        gl.drawArrays(gl.TRIANGLES,0,3);
      }, dispose,
    };
  } catch { dispose(); return null; }
}
