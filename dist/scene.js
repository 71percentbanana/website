import * as THREE from './assets/three.module.min.js';

const canvas = document.querySelector('#scene');
const container = document.querySelector('#sculpture');
const hint = document.querySelector('#scene-hint');
const controls = document.querySelector('#scene-controls');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let renderer;

try {
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  initializeScene();
} catch (error) {
  canvas.hidden = true;
  controls.hidden = true;
  document.querySelector('#scene-fallback').hidden = false;
  hint.textContent = 'An exploration of connection';
  console.warn('Interactive sculpture unavailable', error);
}

function initializeScene() {

  renderer.setClearColor(0xf5f3ee, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 50);
  camera.position.set(0, .15, 8.8);
  camera.lookAt(0, 0, 0);

  // A local studio environment gives the sculpture broad, soft reflections.
  const studio = document.createElement('canvas');
  studio.width = 1024;
  studio.height = 512;
  const context = studio.getContext('2d');
  const background = context.createLinearGradient(0, 0, 0, 512);
  background.addColorStop(0, '#c8e3ef');
  background.addColorStop(.5, '#607f92');
  background.addColorStop(1, '#0f202d');
  context.fillStyle = background;
  context.fillRect(0, 0, 1024, 512);
  context.fillStyle = '#ffffff';
  context.fillRect(80, 50, 120, 310);
  context.fillRect(335, 100, 18, 225);
  context.fillRect(380, 135, 9, 175);
  context.fillRect(590, 50, 230, 180);
  context.fillStyle = '#e7c5a1';
  context.fillRect(900, 170, 80, 210);
  const environment = new THREE.CanvasTexture(studio);
  environment.mapping = THREE.EquirectangularReflectionMapping;
  environment.colorSpace = THREE.SRGBColorSpace;
  const generator = new THREE.PMREMGenerator(renderer);
  const environmentMap = generator.fromEquirectangular(environment);
  scene.environment = environmentMap.texture;
  environment.dispose();
  generator.dispose();
  scene.add(new THREE.HemisphereLight(0xe5f4ff, 0x173345, 2.1));
  const keyLight = new THREE.DirectionalLight(0xe7f6ff, 4);
  keyLight.position.set(-3, 5, 4);
  scene.add(keyLight);
  const rim = new THREE.DirectionalLight(0xffbf8e, 3);
  rim.position.set(4, 1, -3);
  scene.add(rim);

  const sculpture = new THREE.Group();
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xb4d0de, metalness: .98, roughness: .19, clearcoat: .5, clearcoatRoughness: .2
  });
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.02, .34, 320, 48, 2, 3), material);
  knot.rotation.set(.4, -.2, .25);
  sculpture.add(knot);
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(2.0, .012, 8, 160), new THREE.MeshStandardMaterial({ color: 0xc67042, metalness: .6, roughness: .35 }));
  orbit.rotation.set(1.15, .3, -.45);
  sculpture.add(orbit);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(2.65, .004, 6, 180), new THREE.MeshBasicMaterial({ color:0x7ba5ba, transparent:true, opacity:.32 }));
  halo.rotation.set(.9, -.35, .4);
  sculpture.add(halo);
  const accent = new THREE.MeshPhysicalMaterial({ color: 0xea713f, metalness: .3, roughness: .3 });
  const satellite = new THREE.Mesh(new THREE.SphereGeometry(.17, 28, 20), accent);
  satellite.position.set(1.8, .6, .35);
  sculpture.add(satellite);
  const smallSatellite = new THREE.Mesh(new THREE.SphereGeometry(.09, 20, 16), accent);
  smallSatellite.position.set(-1.5, -.8, .8);
  sculpture.add(smallSatellite);
  scene.add(sculpture);
  // Distant points give the scene depth as the camera angle responds to input.
  const positions = [];
  for (let index = 0; index < 150; index++) {
    positions.push(Math.sin(index * 47.31) * 5, Math.cos(index * 23.89) * 4, -2 - (index % 9) / 2);
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({
    color: 0xabcddd, size: .018, transparent: true, opacity: .40, depthWrite: false
  }));
  scene.add(dust);

  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 128;
  const shadowContext = shadowCanvas.getContext('2d');
  const shadowGradient = shadowContext.createRadialGradient(64, 64, 0, 64, 64, 64);
  shadowGradient.addColorStop(0, '#25292338');
  shadowGradient.addColorStop(1, '#25292300');
  shadowContext.fillStyle = shadowGradient;
  shadowContext.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 1.0), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false }));
  shadow.position.set(0, -2.05, -.7);
  scene.add(shadow);

  let paused = reducedMotion.matches;
  let inView = true;
  let dragging = null;
  let angle = .35;
  let pitch = -.15;
  let pointerX = 0;
  let pointerY = 0;
  let elapsed = 0;
  let lastTime = 0;
  let frame = 0;
  let sceneX = 0;
  let baseCameraZ = 8.8;
  let scrollProgress = 0;
  let smoothPointerX = 0;
  let smoothPointerY = 0;
  const motionButton = document.querySelector('#motion');
  function updateMotionButton() {
    motionButton.textContent = paused ? '▷' : 'Ⅱ';
    motionButton.setAttribute('aria-label', paused ? 'Play sculpture rotation' : 'Pause sculpture rotation');
    motionButton.setAttribute('aria-pressed', String(paused));
  }
  updateMotionButton();
  function render(time) {
    frame = 0;
    const delta = Math.min((time - lastTime) / 1000, .05);
    lastTime = time;
    if (!paused && !dragging) { angle += delta * .13; elapsed += delta; }
    smoothPointerX += (pointerX - smoothPointerX) * .055;
    smoothPointerY += (pointerY - smoothPointerY) * .055;
    sculpture.rotation.y = angle + smoothPointerX * .22 + (paused ? 0 : scrollProgress * .35);
    sculpture.rotation.x = pitch + smoothPointerY * .14;
    sculpture.position.set(sceneX, paused ? .1 : .1 + Math.sin(elapsed * .65) * .09, 0);
    camera.position.z = baseCameraZ + (paused ? 0 : scrollProgress * .5);
    dust.rotation.y = pointerX * .13 + Math.sin(elapsed * .1) * .04;
    renderer.render(scene, camera);
    if (!paused && inView && !document.hidden) frame = requestAnimationFrame(render);
  }
  function requestRender() {
    if (!frame && inView && !document.hidden && !canvas.hidden) frame = requestAnimationFrame(render);
  }
  const quality = document.querySelector('#render-quality');
  const qualityScale = { light: .85, high: 1.75, ultra: 2.5 };
  function resize() {
    if (canvas.hidden) return;
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    const automaticScale = Math.min(Math.max(devicePixelRatio, 1.25), 1.75);
    const scale = qualityScale[quality.value] ?? automaticScale;
    renderer.setPixelRatio(Math.min(scale, Math.sqrt(2600000 / (width * height))));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const mobile = matchMedia('(max-width:760px)').matches;
    baseCameraZ = mobile ? Math.max(8.6, 5.1 / camera.aspect) : 8.8;
    const viewWidth = 2 * baseCameraZ * Math.tan(THREE.MathUtils.degToRad(18)) * camera.aspect;
    sceneX = mobile ? 0 : viewWidth * .22;
    sculpture.scale.setScalar(mobile ? 1.03 : 1.16);
    shadow.position.x = sceneX;
    camera.position.z = baseCameraZ;
    camera.updateProjectionMatrix();
    requestRender();
  }
  quality.addEventListener('change', resize);
  new ResizeObserver(resize).observe(container);
  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    requestRender();
  }).observe(container);
  document.addEventListener('visibilitychange', requestRender);
  window.addEventListener('scroll', () => {
    if (paused || reducedMotion.matches || !inView) return;
    scrollProgress = Math.min(1, Math.max(0, -container.getBoundingClientRect().top / innerHeight));
    requestRender();
  }, { passive:true });
  motionButton.addEventListener('click', () => { paused = !paused; updateMotionButton(); requestRender(); });
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; updateMotionButton(); requestRender(); });
  canvas.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    dragging = { id: event.pointerId, x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (dragging?.id === event.pointerId) {
      angle += (event.clientX - dragging.x) * .009;
      pitch = THREE.MathUtils.clamp(pitch + (event.clientY - dragging.y) * .005, -1, 1);
      dragging.x = event.clientX;
      dragging.y = event.clientY;
    } else if (!reducedMotion.matches && event.pointerType === 'mouse') {
      const bounds = canvas.getBoundingClientRect();
      pointerX = (event.clientX - bounds.left) / bounds.width - .5;
      pointerY = (event.clientY - bounds.top) / bounds.height - .5;
    }
    requestRender();
  });
  function release(event) {
    if (dragging?.id === event.pointerId) dragging = null;
    requestRender();
  }
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('lostpointercapture', release);
  canvas.addEventListener('pointerleave', () => { pointerX = pointerY = 0; requestRender(); });
  canvas.addEventListener('keydown', event => {
    const directions = { ArrowLeft: [-.15, 0], ArrowRight: [.15, 0], ArrowUp: [0, -.1], ArrowDown: [0, .1] };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    angle += direction[0];
    pitch = THREE.MathUtils.clamp(pitch + direction[1], -1, 1);
    requestRender();
  });
  const finishes = {
    charcoal: { color: 0xb4d0de, metalness: .98, roughness: .19 },
    orange: { color: 0xe87545, metalness: .35, roughness: .3 },
    porcelain: { color: 0xe2dccf, metalness: .15, roughness: .25 },
    copper: { color: 0xc27b55, metalness: .91, roughness: .38 },
    cobalt: { color: 0x154dba, metalness: .28, roughness: .18 },
    titanium: { color: 0xc4d5df, metalness: .99, roughness: .13 }
  };
  document.querySelectorAll('[data-color]').forEach(button => {
    button.addEventListener('click', () => {
      const finish = finishes[button.dataset.color];
      material.color.setHex(finish.color);
      material.metalness = finish.metalness;
      material.roughness = finish.roughness;
      document.querySelectorAll('[data-color]').forEach(swatch => {
        swatch.classList.toggle('selected', swatch === button);
        swatch.setAttribute('aria-pressed', String(swatch === button));
      });
      requestRender();
    });
  });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    canvas.hidden = true;
    controls.hidden = true;
    document.querySelector('#scene-fallback').hidden = false;
    hint.textContent = '3D paused — reload to restore';
  });
  resize();
  document.querySelector('#scene-fallback').hidden = true;
  controls.hidden = false;
  hint.textContent = 'DRAG TO ROTATE / CHOOSE A FINISH';
}
