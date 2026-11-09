"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "@/components/site/theme";

const YELLOW = "#FFD400";

function fibonacciSphere(n: number, r: number) {
  const pts: THREE.Vector3[] = [];
  const phi = Math.PI * (Math.sqrt(5) - 1);
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const t = phi * i;
    pts.push(new THREE.Vector3(Math.cos(t) * rad * r, y * r, Math.sin(t) * rad * r));
  }
  return pts;
}

function Network({ count, highlight, ink }: { count: number; highlight: number; ink: string }) {
  const group = useRef<THREE.Group>(null);
  const pulses = useRef<THREE.InstancedMesh>(null);
  const { nodes, linePositions, spokes, spokePositions } = useMemo(() => {
    const nodes = fibonacciSphere(count, 2);
    const segs: number[] = [];
    nodes.forEach((a, i) => {
      nodes.forEach((b, j) => {
        if (j > i && a.distanceTo(b) < 0.95) segs.push(a.x, a.y, a.z, b.x, b.y, b.z);
      });
    });
    const spokes = nodes.filter((_, i) => i % Math.max(1, Math.floor(count / highlight)) === 0).slice(0, highlight);
    const spokePositions = new Float32Array(spokes.flatMap((s) => [0, 0, 0, s.x, s.y, s.z]));
    return { nodes, linePositions: new Float32Array(segs), spokes, spokePositions };
  }, [count, highlight]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, dt) => {
    const g = group.current;
    if (g) {
      g.rotation.y += dt * 0.08;
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.3, 2, dt);
      g.rotation.z = THREE.MathUtils.damp(g.rotation.z, state.pointer.x * 0.15, 2, dt);
    }
    const p = pulses.current;
    if (p) {
      const t = state.clock.elapsedTime;
      spokes.forEach((s, i) => {
        const k = (t * 0.35 + i / spokes.length) % 1;
        dummy.position.copy(s).multiplyScalar(1 - k);
        dummy.scale.setScalar(0.6 + Math.sin(k * Math.PI) * 0.6);
        dummy.updateMatrix();
        p.setMatrixAt(i, dummy.matrix);
      });
      p.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={ink} transparent opacity={0.16} />
      </lineSegments>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[spokePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={ink} transparent opacity={0.35} />
      </lineSegments>
      {nodes.map((n, i) => {
        const isSpoke = spokes.includes(n);
        return (
          <mesh key={i} position={n}>
            <sphereGeometry args={[isSpoke ? 0.075 : 0.035, 16, 16]} />
            <meshStandardMaterial color={isSpoke ? YELLOW : ink} emissive={isSpoke ? YELLOW : "#000"} emissiveIntensity={isSpoke ? 0.35 : 0} roughness={0.4} />
          </mesh>
        );
      })}
      <instancedMesh ref={pulses} args={[undefined, undefined, spokes.length]}>
        <sphereGeometry args={[0.035, 10, 10]} />
        <meshBasicMaterial color={ink} />
      </instancedMesh>
      <mesh>
        <cylinderGeometry args={[0.42, 0.42, 0.14, 6]} />
        <meshStandardMaterial color={YELLOW} metalness={0.5} roughness={0.25} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, 0.012, 8, 96]} />
        <meshBasicMaterial color={ink} />
      </mesh>
    </group>
  );
}

export default function NetworkScene({ active = true, highlight = 22 }: { active?: boolean; highlight?: number }) {
  const ink = useTheme() === "dark" ? "#f3f3f1" : "#111111";
  return (
    <Canvas frameloop={active ? "always" : "never"} dpr={[1, 1.75]} camera={{ position: [0, 0, 6], fov: 40 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 3, 5]} intensity={1.4} />
      <Network count={140} highlight={highlight} ink={ink} />
    </Canvas>
  );
}
