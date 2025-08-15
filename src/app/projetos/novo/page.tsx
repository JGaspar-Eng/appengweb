"use client";

import { useEffect, useRef, useState } from "react";
import InternalHeaderNovo from "@/app/components/InternalHeaderNovo";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import DxfParser from "dxf-parser";

const GRID_CM = 10;
const SNAP_CM = 5;
const DEFAULT_PILAR_BX = 25;
const DEFAULT_PILAR_BY = 40;
const DEFAULT_VIGA_ESP = 16;

type Tool = "select" | "beam" | "slab" | "column";

function snap(n: number, step = SNAP_CM) {
  return Math.round(n / step) * step;
}

function lineMat(color = 0x000000) {
  return new THREE.LineBasicMaterial({ color });
}

function makeRectOutline(x: number, y: number, w: number, h: number, color = 0x222222) {
  const pts = [
    new THREE.Vector3(x, y, 0),
    new THREE.Vector3(x + w, y, 0),
    new THREE.Vector3(x + w, y + h, 0),
    new THREE.Vector3(x, y + h, 0),
    new THREE.Vector3(x, y, 0),
  ];
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  return new THREE.Line(geo, lineMat(color));
}

function makeBeam(x1: number, y1: number, x2: number, y2: number, esp = DEFAULT_VIGA_ESP, color = 0x0f5132) {
  const dir = new THREE.Vector2(x2 - x1, y2 - y1);
  const len = dir.length();
  if (len < 0.0001) return new THREE.Group();
  dir.normalize();
  const n = new THREE.Vector2(-dir.y, dir.x);
  const off = esp / 2;

  const a1 = new THREE.Vector3(x1 + n.x * off, y1 + n.y * off, 0);
  const b1 = new THREE.Vector3(x2 + n.x * off, y2 + n.y * off, 0);
  const a2 = new THREE.Vector3(x1 - n.x * off, y1 - n.y * off, 0);
  const b2 = new THREE.Vector3(x2 - n.x * off, y2 - n.y * off, 0);

  const g1 = new THREE.BufferGeometry().setFromPoints([a1, b1]);
  const g2 = new THREE.BufferGeometry().setFromPoints([a2, b2]);

  const m = lineMat(color);
  const L1 = new THREE.Line(g1, m);
  const L2 = new THREE.Line(g2, m);

  const grp = new THREE.Group();
  grp.add(L1, L2);
  return grp;
}

export default function NovoProjetoPage() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [tool, setTool] = useState<Tool>("select");

  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.OrthographicCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const controlsRef = useRef<OrbitControls>();
  const dxfGroupRef = useRef<THREE.Group>(new THREE.Group());
  const drawGroupRef = useRef<THREE.Group>(new THREE.Group());

  const raycaster = useRef(new THREE.Raycaster()).current;
  const planeZ0 = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)).current;
  const mouseNdc = new THREE.Vector2();
  const previewRef = useRef<THREE.Object3D | null>(null);
  const firstPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;

    const el = mountRef.current;
    const aspect = el.clientWidth / el.clientHeight;
    const d = 500;
    const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 2000);
    camera.position.set(0, 0, 1000);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN } as any;
    controlsRef.current = controls;

    // grade
    const grid = new THREE.Group();
    const size = 5000;
    const step = GRID_CM;
    const gridMat = lineMat(0xeeeeee);
    for (let x = -size; x <= size; x += step) {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, -size, 0), new THREE.Vector3(x, size, 0)]);
      grid.add(new THREE.Line(g, gridMat));
    }
    for (let y = -size; y <= size; y += step) {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-size, y, 0), new THREE.Vector3(size, y, 0)]);
      grid.add(new THREE.Line(g, gridMat));
    }
    scene.add(grid);

    dxfGroupRef.current.name = "DXF_Background";
    drawGroupRef.current.name = "Draw_Group";
    scene.add(dxfGroupRef.current);
    scene.add(drawGroupRef.current);

    fetch("/teste.dxf")
      .then(res => res.text())
      .then(dxfText => {
        const parser = new DxfParser();
        const dxf = parser.parseSync(dxfText);
        dxfGroupRef.current.clear();
        const m = lineMat(0x222222);

        dxf.entities.forEach((ent: any) => {
          if (ent.type === "LINE" && ent.vertices?.length >= 2) {
            const [p1, p2] = ent.vertices;
            const g = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(p1.x, p1.y, 0),
              new THREE.Vector3(p2.x, p2.y, 0),
            ]);
            dxfGroupRef.current.add(new THREE.Line(g, m));
          }
        });

        const box = new THREE.Box3().setFromObject(dxfGroupRef.current);
        const c = box.getCenter(new THREE.Vector3());
        controls.target.copy(c);
        camera.position.set(c.x, c.y, 1000);
        controls.update();
      });

    const onMouseMove = (e: MouseEvent) => {
      if (!firstPointRef.current) return;
      const pt = worldFromEvent(e);
      const x = snap(pt.x);
      const y = snap(pt.y);
      const fp = firstPointRef.current;

      if (previewRef.current) drawGroupRef.current.remove(previewRef.current);
      if (tool === "beam") previewRef.current = makeBeam(fp.x, fp.y, x, y);
      else if (tool === "slab") previewRef.current = makeRectOutline(Math.min(fp.x, x), Math.min(fp.y, y), Math.abs(x - fp.x), Math.abs(y - fp.y), 0x1f2937);

      if (previewRef.current) drawGroupRef.current.add(previewRef.current);
    };

    const onMouseDown = (e: MouseEvent) => {
      if (tool === "select") return;
      const pt = worldFromEvent(e);
      const x = snap(pt.x);
      const y = snap(pt.y);

      if (tool === "column") {
        drawGroupRef.current.add(makeRectOutline(x - DEFAULT_PILAR_BX / 2, y - DEFAULT_PILAR_BY / 2, DEFAULT_PILAR_BX, DEFAULT_PILAR_BY, 0x7c2d12));
        return;
      }
      if (!firstPointRef.current) firstPointRef.current = { x, y };
      else {
        const fp = firstPointRef.current;
        if (previewRef.current) drawGroupRef.current.remove(previewRef.current);
        if (tool === "beam") drawGroupRef.current.add(makeBeam(fp.x, fp.y, x, y));
        else if (tool === "slab") drawGroupRef.current.add(makeRectOutline(Math.min(fp.x, x), Math.min(fp.y, y), Math.abs(x - fp.x), Math.abs(y - fp.y), 0x1f2937));
        firstPointRef.current = null;
      }
    };

    function worldFromEvent(e: MouseEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseNdc, camera);
      const out = new THREE.Vector3();
      raycaster.ray.intersectPlane(planeZ0, out);
      return out;
    }

    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mousedown", onMouseDown);

    const anim = () => {
      requestAnimationFrame(anim);
      controls.update();
      renderer.render(scene, camera);
    };
    anim();

    return () => {
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
    };
  }, [tool]);

  return (
    <main className="min-h-screen flex flex-col">
      <InternalHeaderNovo title="Editor Estrutural" />
      <div className="border-b p-2 flex gap-2 bg-white">
        <button onClick={() => setTool("select")}>Selecionar</button>
        <button onClick={() => setTool("beam")}>Viga</button>
        <button onClick={() => setTool("slab")}>Laje</button>
        <button onClick={() => setTool("column")}>Pilar</button>
      </div>
      <div className="flex flex-1">
        <div ref={mountRef} className="flex-1 bg-white" />
      </div>
    </main>
  );
}
