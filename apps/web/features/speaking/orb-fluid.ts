/** Small incompressible 2D flow field. Half-float targets are optional; the
 * texture-advection orb still works when the device cannot render to them. */
type Target = { texture: WebGLTexture; framebuffer: WebGLFramebuffer; size: number };
const vertex = `attribute vec2 position; varying vec2 uv; void main(){ uv=position*.5+.5; gl_Position=vec4(position,0,1); }`;
const fragment = `
precision highp float;
varying vec2 uv;
uniform sampler2D field;
uniform sampler2D other;
uniform int pass;
uniform float stepTime;
uniform float decay;
uniform vec2 direction;
uniform vec4 audio;
uniform vec4 history;
uniform float clock;
const vec2 cell=vec2(1./128.);
void main(){
  vec4 center=texture2D(field,uv);
  vec4 left=texture2D(field,uv-vec2(cell.x,0));
  vec4 right=texture2D(field,uv+vec2(cell.x,0));
  vec4 bottom=texture2D(field,uv-vec2(0,cell.y));
  vec4 top=texture2D(field,uv+vec2(0,cell.y));
  if(pass==0){
    float radius=length((uv-.5)*1.5);
    float wave=mod(radius*2.-clock*.25-history.w*.15,1.);
    float pulse=smoothstep(0.,.15,wave)-smoothstep(.15,.3,wave);
    vec3 force=vec3(-sin(history.y*.5)*2.4,cos(history.x*.38)*1.8,1.);
    gl_FragColor=vec4(center.rgb+pulse*audio.x*30.*clamp(radius,0.,1.)*force,1.);
  } else if(pass==1){
    if(uv.x<cell.x) left.x=-center.x;
    if(uv.x>1.-cell.x) right.x=-center.x;
    if(uv.y<cell.y) bottom.y=-center.y;
    if(uv.y>1.-cell.y) top.y=-center.y;
    gl_FragColor=vec4(.5*(right.x-left.x+top.y-bottom.y),0,0,1);
  } else if(pass==2){ gl_FragColor=center*decay;
  } else if(pass==3){
    gl_FragColor=vec4((left.x+right.x+bottom.x+top.x-texture2D(other,uv).x)*.25,0,0,1);
  } else if(pass==4){
    gl_FragColor=vec4(texture2D(other,uv).xy-vec2(right.x-left.x,top.x-bottom.x),0,1);
  } else if(pass==5){
    vec2 back=uv-stepTime*texture2D(other,uv).xy*cell;
    gl_FragColor=vec4(texture2D(field,back).rgb*decay,1.);
  } else {
    vec2 d=direction*cell;
    gl_FragColor=center*.227027027;
    gl_FragColor+=(texture2D(field,uv+d*1.384615385)+texture2D(field,uv-d*1.384615385))*.316216216;
    gl_FragColor+=(texture2D(field,uv+d*3.230769231)+texture2D(field,uv-d*3.230769231))*.070270270;
  }
}`;
export function createOrbFluid(gl: WebGLRenderingContext) {
  const half=gl.getExtension("OES_texture_half_float");
  if(!half||!gl.getExtension("OES_texture_half_float_linear")) return null;
  gl.getExtension("EXT_color_buffer_half_float");
  const targets: Target[]=[], shaders: WebGLShader[]=[];
  let program: WebGLProgram | null=null, buffer: WebGLBuffer | null=null;
  const dispose=()=>{ targets.forEach(t=>{gl.deleteTexture(t.texture);gl.deleteFramebuffer(t.framebuffer);}); shaders.forEach(s=>gl.deleteShader(s)); if(program)gl.deleteProgram(program);if(buffer)gl.deleteBuffer(buffer); };
  try {
    const target=(size:number):Target=>{
      const texture=gl.createTexture(),framebuffer=gl.createFramebuffer();
      if(!texture||!framebuffer){if(texture)gl.deleteTexture(texture);if(framebuffer)gl.deleteFramebuffer(framebuffer);throw new Error("Flow allocation failed");}
      const result={texture,framebuffer,size};targets.push(result);
      gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,size,size,0,gl.RGBA,half.HALF_FLOAT_OES,null);
      gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
      if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error("Flow target unavailable");
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);return result;
    };
    const velocity=[target(128),target(128)],density=[target(512),target(512)],pressure=[target(128),target(128)];
    const divergence=target(128);
    for(const [kind,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]] as const){
      const shader=gl.createShader(kind);if(!shader)throw new Error("Flow shader unavailable");shaders.push(shader);
      gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error("Flow shader failed");
    }
    program=gl.createProgram();if(!program)throw new Error("Flow program unavailable");
    shaders.forEach(s=>gl.attachShader(program!,s));gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error("Flow program failed");
    buffer=gl.createBuffer();if(!buffer)throw new Error("Flow buffer unavailable");
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,"position");
    const locations=Object.fromEntries(["field","other","pass","stepTime","decay","direction","audio","history","clock"].map(name=>[name,gl.getUniformLocation(program!,name)]));
    const audio=new Float32Array(4),history=new Float32Array(4);let clock=0,tail=0;
    const render=(pass:number,destination:Target,field:Target,other=field)=>{
      gl.bindFramebuffer(gl.FRAMEBUFFER,destination.framebuffer);gl.viewport(0,0,destination.size,destination.size);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,field.texture);
      gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,other.texture);
      gl.uniform1i(locations.pass,pass);gl.drawArrays(gl.TRIANGLES,0,3);
    };
    return {
      get texture(){return density[0].texture;}, dispose,
      step(output:Float32Array,input:Float32Array,dt:number){
        clock+=dt; const before=audio[3];
        for(let i=0;i<4;i++){const v=Math.max(output[i],input[i])*2;audio[i]+=(v-audio[i])*(1-Math.pow(.65,dt*60));history[i]+=v*dt*15;}
        if(audio[3]>.001)tail=20;
        if(tail<=0)return;
        tail-=dt;
        gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
        gl.uniform1i(locations.field,0);gl.uniform1i(locations.other,1);gl.uniform1f(locations.stepTime,dt);
        gl.uniform1f(locations.clock,clock);gl.uniform4fv(locations.audio,audio);gl.uniform4fv(locations.history,history);
        if(audio[3]-before>.0001){render(0,velocity[1],velocity[0]);velocity.reverse();render(0,density[1],density[0]);density.reverse();}
        render(1,divergence,velocity[0]);
        gl.uniform1f(locations.decay,Math.pow(.97,dt*60));render(2,pressure[1],pressure[0]);pressure.reverse();
        for(let i=0;i<3;i++){render(3,pressure[1],pressure[0],divergence);pressure.reverse();}
        render(4,velocity[1],pressure[0],velocity[0]);velocity.reverse();
        gl.uniform1f(locations.decay,Math.pow(.98,dt*60));render(5,velocity[1],velocity[0]);velocity.reverse();
        render(5,density[1],density[0],velocity[0]);density.reverse();
        gl.uniform2f(locations.direction,1.2,0);render(6,density[1],density[0]);density.reverse();
        gl.uniform2f(locations.direction,0,1.2);render(6,density[1],density[0]);density.reverse();
      },
    };
  } catch {dispose();return null;}
  finally {gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.activeTexture(gl.TEXTURE0);}
}
