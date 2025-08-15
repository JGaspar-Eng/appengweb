// src/lib/dxfParser.ts
import * as fs from "fs";
import * as path from "path";
import DxfParser from "dxf-parser";

export interface DxfEntity {
  type: string;
  points?: { x: number; y: number }[];
  layer?: string;
}

// Conversão de unidades do DXF para cm
function unitsToScale(insunits: number): number {
  const map: Record<number, number> = {
    0: 1, // sem unidade - assume cm
    1: 1, // polegada
    2: 2.54, // pés -> cm
    3: 30.48, // milhas -> cm
    4: 160934, // milhas náuticas -> cm
    5: 0.1, // mm -> cm
    6: 1, // cm
    7: 100, // m -> cm
  };
  return map[insunits] || 1;
}

export function parseDxf(filePath: string): DxfEntity[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const parser = new DxfParser();
  const dxf = parser.parseSync(raw);

  const scale = unitsToScale(dxf.header?.$INSUNITS || 0);

  const entities: DxfEntity[] = [];

  for (const entity of dxf.entities) {
    if (entity.type === "LINE") {
      entities.push({
        type: "line",
        points: [
          { x: entity.vertices[0].x * scale, y: entity.vertices[0].y * scale },
          { x: entity.vertices[1].x * scale, y: entity.vertices[1].y * scale },
        ],
        layer: entity.layer,
      });
    }
    if (entity.type === "LWPOLYLINE" || entity.type === "POLYLINE") {
      entities.push({
        type: "polyline",
        points: entity.vertices.map((v: any) => ({
          x: v.x * scale,
          y: v.y * scale,
        })),
        layer: entity.layer,
      });
    }
  }

  return entities;
}
