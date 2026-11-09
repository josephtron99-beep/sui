"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { MARK_PATH } from "@/components/ui/logo-paths";
import { useTheme } from "@/components/site/theme";

const INK = "#111111";
const YELLOW = "#FFD400";

function useMarkGeometry(depth = 90) {
  return useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1074 1191"><path d="${MARK_PATH}"/></svg>`;
    const data = new SVGLoader().parse(svg);
    const shapes = data.paths.flatMap((p) => SVGLoader.createShapes(p));
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth,
      bevelEnabled: true,
      bevelThickness: 14,
      bevelSize: 8,
      bevelSegments: 6,
      curveSegments: 28,
    });
    geo.center();
    geo.scale(0.0026, -0.0026, 0.0026);
    geo.computeVertexNormals();
    return geo;
  }, [depth]);
}

function LogoMark3D() {
  const geo = useMarkGeometry();
  const group = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const targetY = state.pointer.x * 0.55 + Math.sin(t * 0.4) * 0.25;
    const targetX = -state.pointer.y * 0.35;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 3, dt);
  });

  return (
    <group ref={group}>
      <mesh geometry={geo} castShadow>
        <meshPhysicalMaterial attach="material-0" color={YELLOW} metalness={0.3} roughness={0.28} clearcoat={1} clearcoatRoughness={0.12} emissive="#ffb800" emissiveIntensity={0.12} />
        <meshStandardMaterial attach="material-1" color={INK} metalness={0.4} roughness={0.35} />
      </mesh>
    </group>
  );
}

function HexCoin({ radius, speed, offset, y, size, color }: { radius: number; speed: number; offset: number; y: number; size: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const a = state.clock.elapsedTime * speed + offset;
    m.position.set(Math.cos(a) * radius, y + Math.sin(a * 1.7) * 0.12, Math.sin(a) * radius * 0.55);
    m.rotation.set(Math.PI / 2 + Math.sin(a) * 0.4, a * 1.5, 0);
  });
  return (
    <mesh ref={ref} castShadow>
      <cylinderGeometry args={[size, size, size * 0.28, 6]} />
      <meshStandardMaterial color={color} metalness={color === YELLOW ? 0.6 : 0.3} roughness={0.28} />
    </mesh>
  );
}

const coins = Array.from({ length: 9 }, (_, i) => ({
  radius: 2.15 + (i % 3) * 0.32,
  speed: 0.22 + (i % 4) * 0.05,
  offset: (i / 9) * Math.PI * 2,
  y: -0.6 + ((i * 37) % 10) / 8,
  size: 0.12 + ((i * 13) % 5) * 0.025,
  ink: i % 3 === 0,
}));

export default function LogoCoinScene({ active = true, orbit = true }: { active?: boolean; orbit?: boolean }) {
  const dark = useTheme() === "dark";
  const inkCoin = dark ? "#f3f3f1" : INK;
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      shadows
      camera={{ position: [0, 0, 7.4], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} castShadow />
      <pointLight position={[-4, -2, 3]} intensity={18} color={YELLOW} />
      <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.6}>
        <LogoMark3D />
      </Float>
      {orbit && coins.map(({ ink, ...c }, i) => <HexCoin key={i} {...c} color={ink ? inkCoin : YELLOW} />)}
      <ContactShadows position={[0, -2.05, 0]} opacity={dark ? 0.5 : 0.28} scale={9} blur={2.6} far={4} color={dark ? "#000000" : INK} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.5} color={YELLOW} position={[-5, 0, 2]} scale={[3, 6, 1]} />
        <Lightformer form="ring" intensity={2} position={[4, 1, 4]} scale={2} />
      </Environment>
    </Canvas>
  );
}
