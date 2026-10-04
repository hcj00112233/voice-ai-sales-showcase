import * as THREE from "three";

export type VoiceScene = "learning" | "localization" | "care";
export type SculptureController = {
  setScene: (scene: VoiceScene) => void;
  dispose: () => void;
};

// Every scene shares the same ribbon topology, so interruptions start from the visible pose.
function fillCurves(
  out: Float32Array,
  scene: VoiceScene,
  time: number,
  count: number,
  steps: number,
) {
  for (let piece = 0; piece < count; piece++) {
    const k = piece / (count - 1);
    for (let j = 0; j <= steps; j++) {
      const u = j / steps;
      let x: number, y: number, z: number;
      if (scene === "learning") {
        const a = u * Math.PI * 2;
        const wave = Math.sin(a * 3 + k * 4 - time * 0.6) * 0.035;
        const radius =
          0.99 + Math.cos(a * 2 + k * 0.8) * 0.1 + (k - 0.5) * 0.15 + wave;
        x = Math.cos(a) * radius;
        y = Math.sin(a) * radius * 0.91;
        z = (k - 0.5) * 1.04 + Math.sin(a * 2 + k * 0.6) * 0.18;
      } else if (scene === "localization") {
        const band = Math.min(2, Math.floor(k * 3));
        const local = (piece % (count / 3)) / (count / 3 - 1) - 0.5;
        x = (u - 0.5) * 3.15;
        y =
          Math.sin(u * Math.PI * 2 - 0.45) * 0.38 +
          (band - 1) * 0.56 +
          local * 0.17;
        z =
          Math.cos(u * Math.PI * 2 + time * 0.12) * 0.22 +
          (band - 1) * 0.23 +
          local * 0.34;
      } else {
        const side = piece < count / 2 ? -1 : 1;
        const local = (piece % (count / 2)) / (count / 2 - 1);
        const a = Math.PI * (0.27 + u * 1.46);
        const response =
          Math.sin(time * 0.85 + (side < 0 ? 0 : Math.PI)) * 0.035;
        const radius = 0.67 + local * 0.1 + response;
        const connection = Math.pow(
          Math.max(0, Math.sin(time * 0.85 - 1.4)),
          10,
        );
        x = side * (0.85 - connection * 0.29) - side * Math.cos(a) * radius;
        y = Math.sin(a) * radius;
        z = (local - 0.5) * 0.75 + Math.sin(a * 2) * 0.1;
      }
      const i = (piece * (steps + 1) + j) * 3;
      out[i] = x;
      out[i + 1] = y;
      out[i + 2] = z;
    }
  }
}

function studioEnvironment(renderer: THREE.WebGLRenderer) {
  const studio = new THREE.Scene();
  studio.background = new THREE.Color(0.065, 0.075, 0.095);
  const panels: THREE.Mesh[] = [];
  const panel = (
    w: number,
    h: number,
    x: number,
    y: number,
    z: number,
    color: THREE.Color,
  ) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }),
    );
    mesh.position.set(x, y, z);
    mesh.lookAt(0, 0, 0);
    studio.add(mesh);
    panels.push(mesh);
  };
  panel(6, 9, -4, 3, 4, new THREE.Color(5, 5, 5));
  panel(2, 10, 4, 1, 3, new THREE.Color(4, 4.3, 4.6));
  panel(8, 2, 0, 5, -2, new THREE.Color(6, 5.8, 5.4));
  panel(8, 1, 0, -3, 4, new THREE.Color(2, 2, 2));
  panel(3, 7, -3, 0, -5, new THREE.Color(0.025, 0.03, 0.04));
  panel(1.3, 6, 1, 0, 6, new THREE.Color(0.025, 0.03, 0.04));
  const generator = new THREE.PMREMGenerator(renderer);
  const result = generator.fromScene(studio, 0.035, 0.1, 100, { size: 128 });
  panels.forEach((p) => {
    p.geometry.dispose();
    (p.material as THREE.Material).dispose();
  });
  generator.dispose();
  return result;
}

function glintTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const glow = ctx.createRadialGradient(64, 64, 0, 64, 64, 62);
  glow.addColorStop(0, "rgba(255,255,255,1)");
  glow.addColorStop(0.07, "rgba(255,255,255,1)");
  glow.addColorStop(0.22, "rgba(244,248,255,.45)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 128, 128);
  for (const vertical of [false, true]) {
    const streak = ctx.createLinearGradient(
      vertical ? 0 : 6,
      vertical ? 6 : 0,
      vertical ? 0 : 122,
      vertical ? 122 : 0,
    );
    streak.addColorStop(0, "transparent");
    streak.addColorStop(0.5, "white");
    streak.addColorStop(1, "transparent");
    ctx.fillStyle = streak;
    ctx.fillRect(
      vertical ? 63 : 6,
      vertical ? 6 : 63,
      vertical ? 2 : 116,
      vertical ? 116 : 2,
    );
  }
  return new THREE.CanvasTexture(canvas);
}

export function mountSculpture(
  canvas: HTMLCanvasElement,
  initial: VoiceScene,
  onReady: (ready: boolean) => void,
): SculptureController {
  const host = canvas.parentElement!;
  const interactionArea = host.parentElement!;
  const mobile = matchMedia("(max-width: 760px)").matches;
  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = motionQuery.matches;
  const count = mobile ? 18 : 30,
    steps = mobile ? 72 : 112,
    sides = mobile ? 6 : 8;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.35 : 1.8));
  renderer.setClearColor(0xfdfcfc, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const world = new THREE.Scene();
  const environment = studioEnvironment(renderer);
  world.environment = environment.texture;
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30);
  camera.position.set(0, 0, 6.5);
  const sculpture = new THREE.Group();
  sculpture.position.y = 0.13;
  world.add(sculpture);

  const vertexCount = count * (steps + 1) * sides;
  const positions = new Float32Array(vertexCount * 3),
    normals = new Float32Array(vertexCount * 3);
  const indices: number[] = [];
  for (let p = 0; p < count; p++)
    for (let j = 0; j < steps; j++)
      for (let s = 0; s < sides; s++) {
        const a = (p * (steps + 1) + j) * sides + s,
          b = (p * (steps + 1) + j) * sides + ((s + 1) % sides);
        indices.push(a, b, a + sides, b, b + sides, a + sides);
      }
  const meshGeometry = new THREE.BufferGeometry();
  meshGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage),
  );
  meshGeometry.setAttribute(
    "normal",
    new THREE.BufferAttribute(normals, 3).setUsage(THREE.DynamicDrawUsage),
  );
  meshGeometry.setIndex(indices);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xf1f3f6,
    metalness: 1,
    roughness: 0.09,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.65,
    iridescence: 0.12,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [120, 260],
    side: THREE.FrontSide,
  });
  const shine = { value: 0 };
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uShine = shine;
    shader.fragmentShader = "uniform float uShine;\n" + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <opaque_fragment>",
      `
      float lightSweep = pow(0.5 + 0.5 * sin(vViewPosition.x * 2.4 + vViewPosition.y * 1.8 + uShine), 28.0);
      float grazingLight = pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 2.0);
      outgoingLight += vec3(0.86, 0.92, 1.0) * lightSweep * (0.32 + grazingLight * 0.8);
      #include <opaque_fragment>
    `,
    );
  };
  const mesh = new THREE.Mesh(meshGeometry, material);
  mesh.frustumCulled = false;
  sculpture.add(mesh);
  world.add(new THREE.HemisphereLight(0xffffff, 0x73777f, 1.4));
  const key = new THREE.PointLight(0xffffff, 28, 16, 2);
  key.position.set(-3, 3, 4);
  world.add(key);
  const sweep = new THREE.PointLight(0xe3edff, 15, 12, 2);
  world.add(sweep);

  const texture = glintTexture();
  const glints = Array.from({ length: mobile ? 2 : 4 }, () => {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    );
    sprite.scale.setScalar(0.14);
    sculpture.add(sprite);
    return sprite;
  });
  const goal = new Float32Array(count * (steps + 1) * 3);
  const current = new Float32Array(goal.length),
    from = new Float32Array(goal.length);
  fillCurves(goal, initial, 0, count, steps);
  current.set(goal);
  from.set(goal);
  // Scatter intact sheets, rather than randomizing vertices and creating broken triangles.
  if (!reduced)
    for (let p = 0; p < count; p++) {
      const angle = (p / count - 0.5) * 1.7,
        cos = Math.cos(angle),
        sin = Math.sin(angle);
      for (let j = 0; j <= steps; j++) {
        const i = (p * (steps + 1) + j) * 3,
          x = from[i],
          z = from[i + 2];
        from[i] = x * cos + z * sin + Math.sin(p * 2.4) * 0.55;
        from[i + 1] += Math.cos(p * 1.8) * 0.45;
        from[i + 2] = -x * sin + z * cos + (p / count - 0.5) * 1.7;
      }
    }
  let target = initial,
    start = performance.now(),
    birth = start,
    previous = start;
  let transition = !reduced,
    raf = 0,
    visible = true,
    disposed = false,
    lost = false;
  let pointerX = 0,
    pointerY = 0,
    tiltX = 0,
    tiltY = 0,
    hover = 0,
    hoverTarget = 0;
  const ringCos = Array.from({ length: sides }, (_, i) =>
    Math.cos((i / sides) * Math.PI * 2),
  );
  const ringSin = Array.from({ length: sides }, (_, i) =>
    Math.sin((i / sides) * Math.PI * 2),
  );
  const fit = () => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = Math.max(
      5.25,
      3.9 / (camera.aspect * Math.tan((17 * Math.PI) / 180) * 2),
    );
    camera.updateProjectionMatrix();
    schedule();
  };
  function schedule() {
    if (!raf && !disposed && visible && !document.hidden && !lost)
      raf = requestAnimationFrame(draw);
  }
  function draw(now: number) {
    raf = 0;
    const dt = Math.min((now - previous) / 1000, 0.05);
    previous = now;
    const time = reduced ? 0 : (now - birth) / 1000;
    const progress = transition
      ? Math.min(1, (now - start) / (reduced ? 200 : 1450))
      : 1;
    const ease =
      progress * progress * progress * (progress * (progress * 6 - 15) + 10);
    const release = reduced ? 0 : Math.sin(Math.PI * ease);
    fillCurves(goal, target, time, count, steps);
    for (let i = 0; i < current.length; i += 3) {
      const layer = Math.floor(i / (3 * (steps + 1))) / (count - 1) - 0.5;
      const blend = reduced ? (progress < 0.5 ? 0 : 1) : ease;
      current[i] =
        from[i] + (goal[i] - from[i]) * blend + release * layer * 0.5;
      current[i + 1] = from[i + 1] + (goal[i + 1] - from[i + 1]) * blend;
      current[i + 2] =
        from[i + 2] +
        (goal[i + 2] - from[i + 2]) * blend +
        release * layer * 1.2;
    }
    hover += (hoverTarget - hover) * (1 - Math.exp(-dt * 5));
    tiltX += (pointerY * 0.14 - tiltX) * (1 - Math.exp(-dt * 5));
    tiltY += (pointerX * 0.2 - tiltY) * (1 - Math.exp(-dt * 5));
    for (let p = 0; p < count; p++)
      for (let j = 0; j <= steps; j++) {
        const c = (p * (steps + 1) + j) * 3;
        const before = (p * (steps + 1) + Math.max(0, j - 1)) * 3;
        const after = (p * (steps + 1) + Math.min(steps, j + 1)) * 3;
        let tx = current[after] - current[before],
          ty = current[after + 1] - current[before + 1],
          tz = current[after + 2] - current[before + 2];
        const length = Math.hypot(tx, ty, tz) || 1;
        tx /= length;
        ty /= length;
        tz /= length;
        const xy = Math.hypot(tx, ty) || 1;
        const nx = -ty / xy,
          ny = tx / xy;
        const bx = -tz * ny,
          by = tz * nx,
          bz = tx * ny - ty * nx;
        for (let s = 0; s < sides; s++) {
          const i = ((p * (steps + 1) + j) * sides + s) * 3;
          const a = ringCos[s],
            b = ringSin[s];
          positions[i] = current[c] + nx * a * 0.047 + bx * b * 0.016;
          positions[i + 1] = current[c + 1] + ny * a * 0.047 + by * b * 0.016;
          positions[i + 2] =
            current[c + 2] + bz * b * 0.016 + (p / count - 0.5) * hover * 0.15;
          const vx = (nx * a) / 0.047 + (bx * b) / 0.016,
            vy = (ny * a) / 0.047 + (by * b) / 0.016,
            vz = (bz * b) / 0.016;
          const nl = Math.hypot(vx, vy, vz) || 1;
          normals[i] = vx / nl;
          normals[i + 1] = vy / nl;
          normals[i + 2] = vz / nl;
        }
      }
    meshGeometry.attributes.position.needsUpdate = true;
    meshGeometry.attributes.normal.needsUpdate = true;
    const orient =
      target === "learning" ? 0.42 : target === "localization" ? -0.16 : 0.12;
    sculpture.rotation.y +=
      (orient + tiltY - sculpture.rotation.y) * (1 - Math.exp(-dt * 3));
    sculpture.rotation.x =
      -0.18 + tiltX + (reduced ? 0 : Math.sin(time * 0.35) * 0.035);
    sculpture.rotation.z =
      -0.12 + (reduced ? 0 : Math.sin(time * 0.24) * 0.025);
    sculpture.position.y = 0.12 + (reduced ? 0 : Math.sin(time * 0.75) * 0.035);
    if (reduced) {
      sculpture.rotation.y = orient;
      canvas.style.opacity = transition
        ? String(Math.abs(progress * 2 - 1))
        : "1";
    }
    shine.value = time * 0.72;
    world.environmentRotation.y = reduced
      ? 0.25
      : 0.25 + Math.sin(time * 0.25) * 0.25;
    sweep.position.set(Math.sin(time * 0.45) * 3, 1.6, 3.8);
    glints.forEach((sprite, index) => {
      const p = Math.floor(((index + 0.5) / glints.length) * (count - 1));
      const u = (0.12 + index * 0.23 + time * 0.015) % 1;
      const i = (p * (steps + 1) + Math.floor(u * steps)) * 3;
      sprite.position.set(current[i], current[i + 1], current[i + 2] + 0.025);
      (sprite.material as THREE.SpriteMaterial).opacity = reduced
        ? 0.25
        : Math.pow(Math.max(0, Math.sin(time * 0.85 + index * 1.7)), 8) * 0.8;
    });
    renderer.render(world, camera);
    if (transition && progress === 1) transition = false;
    if (!reduced || transition) schedule();
  }
  const move = (event: PointerEvent) => {
    if (reduced || event.pointerType === "touch") return;
    const rect = interactionArea.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width - 0.5;
    pointerY = (event.clientY - rect.top) / rect.height - 0.5;
    hoverTarget = 1;
    schedule();
  };
  const leave = () => {
    pointerX = pointerY = hoverTarget = 0;
    schedule();
  };
  const motionChange = () => {
    reduced = motionQuery.matches;
    canvas.style.opacity = "1";
    schedule();
  };
  const visibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else schedule();
  };
  const contextLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(raf);
    raf = 0;
    onReady(false);
  };
  const contextRestored = () => {
    lost = false;
    onReady(true);
    schedule();
  };
  const observer = new ResizeObserver(fit);
  observer.observe(host);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule();
    else {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  });
  intersection.observe(host);
  interactionArea.addEventListener("pointermove", move);
  interactionArea.addEventListener("pointerleave", leave);
  motionQuery.addEventListener("change", motionChange);
  document.addEventListener("visibilitychange", visibility);
  canvas.addEventListener("webglcontextlost", contextLost);
  canvas.addEventListener("webglcontextrestored", contextRestored);
  fit();
  onReady(true);
  schedule();
  return {
    setScene(next) {
      if (next === target) return;
      from.set(current);
      target = next;
      start = performance.now();
      transition = true;
      schedule();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      intersection.disconnect();
      interactionArea.removeEventListener("pointermove", move);
      interactionArea.removeEventListener("pointerleave", leave);
      motionQuery.removeEventListener("change", motionChange);
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", contextRestored);
      glints.forEach((sprite) =>
        (sprite.material as THREE.SpriteMaterial).dispose(),
      );
      texture.dispose();
      meshGeometry.dispose();
      material.dispose();
      environment.dispose();
      renderer.dispose();
    },
  };
}
