import * as THREE from './vendor/three.module.js';

let stage = document.getElementById('three-visualization');
if (!stage) {
  stage = document.createElement('div');
  const parent = document.querySelector('.hero-content,.auth-intro');
  if (parent) parent.append(stage);
}
if (stage?.isConnected) {
  stage.classList.add('mo-3d-stage');
  stage.setAttribute('role','img');
  stage.setAttribute('aria-label','Decorative 3D DNA helix with orbital rings and a particle field');
  const label = document.createElement('span');label.className='mo-3d-label';label.textContent='Clinical intelligence · Move your pointer to explore';stage.append(label);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({alpha:true,antialias:true}); } catch {label.textContent='Clinical intelligence · 3D preview unavailable on this device';}
  if (renderer) {
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));stage.append(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden','true');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45,1,.1,100);camera.position.z=8;
    scene.add(new THREE.AmbientLight(0xffffff,2));
    const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,4,5);scene.add(light);
    const root=new THREE.Group();scene.add(root);
    const sphere=new THREE.SphereGeometry(.085,12,8);
    const violet=new THREE.MeshStandardMaterial({color:0x8b5cf6,metalness:.35,roughness:.3});
    const blue=new THREE.MeshStandardMaterial({color:0x38bdf8,metalness:.35,roughness:.3});
    const links=[];
    for(let i=0;i<44;i++) {
      const a=i*.29, y=(i-21.5)*.09;
      const p=new THREE.Vector3(Math.cos(a)*.75,y,Math.sin(a)*.75);
      const q=new THREE.Vector3(-p.x,y,-p.z);
      for(const [point,mat] of [[p,violet],[q,blue]]) {const ball=new THREE.Mesh(sphere,mat);ball.position.copy(point);root.add(ball);}
      links.push(p.x,p.y,p.z,q.x,q.y,q.z);
    }
    const linkGeometry=new THREE.BufferGeometry();linkGeometry.setAttribute('position',new THREE.Float32BufferAttribute(links,3));
    root.add(new THREE.LineSegments(linkGeometry,new THREE.LineBasicMaterial({color:0xa78bfa,transparent:true,opacity:.45})));
    const rings=new THREE.Group();scene.add(rings);
    for(let i=0;i<3;i++) {
      const ring=new THREE.Mesh(new THREE.TorusGeometry(2.2+i*.16,.012,6,100),new THREE.MeshBasicMaterial({color:i===1?0x38bdf8:0xa78bfa,transparent:true,opacity:.3}));
      ring.rotation.set(.5+i*.5,.3+i*.6,0);rings.add(ring);
    }
    const points=new THREE.BufferGeometry();const positions=[];
    for(let i=0;i<180;i++) positions.push((Math.random()-.5)*10,(Math.random()-.5)*6,(Math.random()-.5)*5);
    points.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    const particles=new THREE.Points(points,new THREE.PointsMaterial({color:0x9d7de5,size:.035,transparent:true,opacity:.65}));scene.add(particles);
    let pointer={x:0,y:0},visible=true,disposed=false;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const paused=()=>reduced.matches || document.documentElement.classList.contains('mo-motion-paused');
    const move=e=>{const b=stage.getBoundingClientRect();pointer={x:(e.clientX-b.left)/b.width-.5,y:(e.clientY-b.top)/b.height-.5};};
    const leave=()=>{pointer={x:0,y:0};};stage.addEventListener('pointermove',move);stage.addEventListener('pointerleave',leave);
    function render(time=0) {
      if(disposed) return;
      const t=time*.00025;
      if(!paused()) {root.rotation.y=t+pointer.x*.65;root.rotation.x=pointer.y*.3;rings.rotation.z=t*.25;particles.rotation.y=t*.12;root.position.y=Math.sin(t*2)*.08;}
      renderer.render(scene,camera);
    }
    function sync() {if(disposed)return;renderer.setAnimationLoop(null);render();if(visible && !document.hidden && !paused())renderer.setAnimationLoop(render);}
    const resize=new ResizeObserver(()=>{const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);render();});resize.observe(stage);
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});observer.observe(stage);
    document.addEventListener('visibilitychange',sync);window.addEventListener('mo-motion-change',sync);reduced.addEventListener('change',sync);sync();
    // Preserve the scene for back/forward cache restores.
    window.addEventListener('pagehide',event=>{
      renderer.setAnimationLoop(null);if(event.persisted)return;
      disposed=true;resize.disconnect();observer.disconnect();stage.removeEventListener('pointermove',move);stage.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',sync);window.removeEventListener('mo-motion-change',sync);reduced.removeEventListener('change',sync);
      const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();
    });window.addEventListener('pageshow',sync);
  }
}
