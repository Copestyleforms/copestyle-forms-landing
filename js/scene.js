(function () {
  'use strict';

  var container = document.getElementById('scene-container');
  var canvas = document.getElementById('webgl');

  if (!container || !canvas || typeof THREE === 'undefined') {
    return;
  }

  var isMobile = window.innerWidth < 900;

  var COLORS = {
    void: 0x05080f,
    body: 0x0d1522,
    frame: 0xb8c6d4,
    electric: 0x4db8ff,
    electricBright: 0x7fd0ff,
    fill: 0x3a6d99
  };

  var scene, camera, renderer;
  var phoneGroup, screenMesh, screenTexture, screenCtx, screenCanvas;
  var circuitMaterials = [];
  var clock = new THREE.Clock();

  var scrollState = { progress: 0 };
  var cam = {
    theta: -0.32,
    height: 0.35,
    dist: 6.6,
    targetTheta: -0.32,
    targetHeight: 0.35,
    targetDist: 6.6
  };

  var PHONE_TARGET = new THREE.Vector3(1.35, 0.05, 0);

  try {
    init();
    animate();
  } catch (err) {
    console.warn('Copestyle Forms — la escena 3D no pudo iniciarse, el sitio continúa sin fondo animado.', err);
  }

  function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.void);
    scene.fog = new THREE.FogExp2(COLORS.void, isMobile ? 0.085 : 0.065);

    camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    updateCameraPosition(true);

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !isMobile,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.shadowMap.enabled = !isMobile;
    if (renderer.shadowMap.enabled) {
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    buildLights();
    buildPhone();
    buildCircuits();
    buildParticles();

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Luces ---------- */
  function buildLights() {
    var ambient = new THREE.AmbientLight(0x1c2c40, 0.55);
    scene.add(ambient);

    var key = new THREE.DirectionalLight(0xffffff, 1.05);
    key.position.set(3.2, 4.4, 5.2);
    if (!isMobile) {
      key.castShadow = true;
      key.shadow.mapSize.width = 1024;
      key.shadow.mapSize.height = 1024;
      key.shadow.camera.near = 1;
      key.shadow.camera.far = 20;
      key.shadow.camera.left = -4;
      key.shadow.camera.right = 4;
      key.shadow.camera.top = 4;
      key.shadow.camera.bottom = -4;
      key.shadow.bias = -0.001;
    }
    scene.add(key);

    var fill = new THREE.DirectionalLight(COLORS.electric, 0.35);
    fill.position.set(-4, -1.5, 2.5);
    scene.add(fill);

    var rim = new THREE.DirectionalLight(COLORS.electricBright, 0.9);
    rim.position.set(-2.4, 2.6, -4.2);
    scene.add(rim);
  }

  /* ---------- Teléfono ---------- */
  function buildPhone() {
    phoneGroup = new THREE.Group();
    phoneGroup.position.copy(PHONE_TARGET);
    phoneGroup.rotation.set(0.08, -0.42, 0.05);

    var frame = new THREE.Mesh(
      new THREE.BoxGeometry(1.14, 2.24, 0.16),
      new THREE.MeshStandardMaterial({ color: COLORS.frame, metalness: 0.85, roughness: 0.3 })
    );
    frame.castShadow = !isMobile;
    frame.receiveShadow = !isMobile;
    phoneGroup.add(frame);

    var body = new THREE.Mesh(
      new THREE.BoxGeometry(1.04, 2.12, 0.1),
      new THREE.MeshStandardMaterial({ color: COLORS.body, metalness: 0.55, roughness: 0.42 })
    );
    body.position.z = 0.035;
    body.castShadow = !isMobile;
    phoneGroup.add(body);

    screenCanvas = document.createElement('canvas');
    screenCanvas.width = 256;
    screenCanvas.height = 512;
    screenCtx = screenCanvas.getContext('2d');
    screenTexture = new THREE.CanvasTexture(screenCanvas);
    drawScreen(0);

    screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 1.94),
      new THREE.MeshBasicMaterial({ map: screenTexture })
    );
    screenMesh.position.z = 0.092;
    phoneGroup.add(screenMesh);

    var camBump = new THREE.Mesh(
      new THREE.CircleGeometry(0.045, 24),
      new THREE.MeshStandardMaterial({ color: 0x11202f, metalness: 0.7, roughness: 0.3 })
    );
    camBump.position.set(0, 0.98, 0.093);
    phoneGroup.add(camBump);

    scene.add(phoneGroup);
  }

  /* Dibuja el formulario simulado en el canvas de la pantalla */
  var formState = { step: 0, steps: 6, progress: 0 };

  function drawScreen() {
    var w = screenCanvas.width;
    var h = screenCanvas.height;
    var ctx = screenCtx;

    ctx.fillStyle = '#0a1220';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#4db8ff';
    ctx.fillRect(0, 0, w, 46);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(22, 18, 90, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(w - 46, 16, 24, 14);

    var fieldsY = 78;
    var fieldGap = 46;
    var totalFields = formState.steps;

    for (var i = 0; i < totalFields; i++) {
      var y = fieldsY + i * fieldGap;
      var checked = i < formState.step;

      ctx.strokeStyle = 'rgba(184,198,212,0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(22, y, 20, 20);

      if (checked) {
        ctx.fillStyle = '#4db8ff';
        ctx.fillRect(22, y, 20, 20);
        ctx.strokeStyle = '#071018';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(26, y + 10);
        ctx.lineTo(30, y + 15);
        ctx.lineTo(38, y + 5);
        ctx.stroke();
      }

      ctx.fillStyle = checked ? 'rgba(232,238,245,0.75)' : 'rgba(184,198,212,0.28)';
      var lineWidth = 130 - (i % 3) * 18;
      ctx.fillRect(54, y + 6, lineWidth, 8);
    }

    var barY = h - 96;
    ctx.fillStyle = 'rgba(184,198,212,0.15)';
    ctx.fillRect(22, barY, w - 44, 8);
    ctx.fillStyle = '#7fd0ff';
    ctx.fillRect(22, barY, (w - 44) * formState.progress, 8);

    var btnActive = formState.progress > 0.94;
    ctx.fillStyle = btnActive ? '#7fd0ff' : 'rgba(77,184,255,0.4)';
    ctx.fillRect(22, h - 62, w - 44, 40);
    ctx.fillStyle = btnActive ? '#071018' : 'rgba(7,16,24,0.6)';
    ctx.fillRect(w / 2 - 34, h - 46, 68, 8);

    screenTexture.needsUpdate = true;
  }

  var formTimer = 0;
  function updateForm(delta) {
    formTimer += delta;
    var stepDuration = 0.55;
    var totalCycle = formState.steps * stepDuration + 1.4;
    var t = formTimer % totalCycle;

    var stepFloat = t / stepDuration;
    formState.step = Math.min(formState.steps, Math.floor(stepFloat));
    formState.progress = Math.min(1, t / (formState.steps * stepDuration));

    if (t >= formState.steps * stepDuration + 1.4 - 0.05) {
      formTimer = 0;
    }

    drawScreen();
  }

  /* ---------- Circuitos ---------- */
  function buildCircuits() {
    var group = new THREE.Group();
    var lineMat = new THREE.LineBasicMaterial({ color: COLORS.electric, transparent: true, opacity: 0.45 });
    circuitMaterials.push(lineMat);

    var count = isMobile ? 7 : 13;
    var origin = PHONE_TARGET;

    for (var i = 0; i < count; i++) {
      var angle = (i / count) * Math.PI * 2;
      var radius = 1.6 + Math.random() * 2.2;
      var elevation = (Math.random() - 0.5) * 2.4;

      var midX = origin.x + Math.cos(angle) * radius * 0.55;
      var midY = origin.y + elevation * 0.5;
      var midZ = origin.z + Math.sin(angle) * radius * 0.55 - 0.6;

      var endX = origin.x + Math.cos(angle) * radius;
      var endY = origin.y + elevation;
      var endZ = origin.z + Math.sin(angle) * radius - 1.2;

      var points = [
        new THREE.Vector3(origin.x, origin.y, origin.z - 0.1),
        new THREE.Vector3(midX, midY, midZ),
        new THREE.Vector3(endX, endY, endZ)
      ];

      var geometry = new THREE.BufferGeometry().setFromPoints(points);
      var line = new THREE.Line(geometry, lineMat);
      group.add(line);

      var nodeMat = new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? COLORS.electricBright : COLORS.electric });
      var node = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), nodeMat);
      node.position.set(endX, endY, endZ);
      group.add(node);

      var midNode = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), nodeMat);
      midNode.position.set(midX, midY, midZ);
      group.add(midNode);
    }

    scene.add(group);
  }

  /* ---------- Partículas ---------- */
  function buildParticles() {
    var count = isMobile ? 140 : 420;
    var positions = new Float32Array(count * 3);

    for (var i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 3;
    }

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    var material = new THREE.PointsMaterial({
      color: COLORS.electric,
      size: 0.028,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true
    });

    var points = new THREE.Points(geometry, material);
    scene.add(points);
  }

  /* ---------- Cámara ligada al scroll ---------- */
  function onScroll() {
    var maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    var progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    scrollState.progress = progress;

    cam.targetTheta = -0.32 + progress * 0.95;
    cam.targetHeight = 0.35 - progress * 0.85;
    cam.targetDist = 6.6 - progress * 1.5;
  }

  function updateCameraPosition(instant) {
    var lerpFactor = instant ? 1 : 0.045;
    cam.theta += (cam.targetTheta - cam.theta) * lerpFactor;
    cam.height += (cam.targetHeight - cam.height) * lerpFactor;
    cam.dist += (cam.targetDist - cam.dist) * lerpFactor;

    camera.position.x = PHONE_TARGET.x + Math.sin(cam.theta) * cam.dist;
    camera.position.z = Math.cos(cam.theta) * cam.dist;
    camera.position.y = cam.height;
    camera.lookAt(PHONE_TARGET);
  }

  function onResize() {
    isMobile = window.innerWidth < 900;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  }

  /* ---------- Loop ---------- */
  function animate() {
    requestAnimationFrame(animate);
    var delta = Math.min(clock.getDelta(), 0.1);
    var elapsed = clock.getElapsedTime();

    if (phoneGroup) {
      phoneGroup.position.y = PHONE_TARGET.y + Math.sin(elapsed * 0.7) * 0.12;
      phoneGroup.rotation.y = -0.42 + Math.sin(elapsed * 0.32) * 0.18;
      phoneGroup.rotation.x = 0.08 + Math.cos(elapsed * 0.25) * 0.04;
    }

    updateForm(delta);
    updateCameraPosition(false);

    var pulse = 0.4 + Math.sin(elapsed * 1.6) * 0.08;
    for (var i = 0; i < circuitMaterials.length; i++) {
      circuitMaterials[i].opacity = pulse;
    }

    renderer.render(scene, camera);
  }
})();
