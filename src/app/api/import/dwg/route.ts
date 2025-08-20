import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { execFile, execSync } from "child_process";
import { promisify } from "util";

const pexecFile = promisify(execFile);

// Resolve o caminho do ODAFileConverter buscando na variável de ambiente ou no PATH.
function resolveOdaConverterPath(): string {
  const envPath = process.env.ODA_CONVERTER;
  if (envPath) return envPath;

  const which = process.platform === "win32" ? "where" : "which";
  try {
    const found = execSync(`${which} ODAFileConverter`, { encoding: "utf-8" })
      .split(/\r?\n/)[0]
      .trim();
    if (found) return found;
  } catch {
    // ignorado
  }
  return ""; // força erro amigável abaixo
}

// Reusa seu pipeline: convertemos DWG -> DXF, depois enviamos o DXF para o importador DXF existente
async function parseDxfToShapes(dxfPath: string): Promise<any[]> {
  // Se você já tem um parser DXF no backend, chame-o aqui.
  // Abaixo, por simplicidade, eu leio o DXF e extraio um "mínimo" (linhas/polyline/rect),
  // mas o ideal é reutilizar o MESMO código da sua rota /api/import/dxf.

  const { default: DxfParser } = await import("dxf-parser"); // certifique-se de ter `dxf-parser` instalado
  const parser = new (DxfParser as any)();
  const dxfStr = await fs.readFile(dxfPath, "utf-8");
  const doc = parser.parseSync(dxfStr);

  const shapes: any[] = [];

  const ents = doc?.entities || [];
  for (const e of ents) {
    switch (e.type) {
      case "LWPOLYLINE":
      case "POLYLINE": {
        const pts = (e.vertices || e.points || []).map((p: any) => ({ x: p.x || 0, y: p.y || 0 }));
        if (pts.length >= 2) shapes.push({ t: "polyline", points: pts });
        break;
      }
      case "LINE": {
        shapes.push({ t: "line", x1: e.startPoint.x, y1: e.startPoint.y, x2: e.endPoint.x, y2: e.endPoint.y });
        break;
      }
      case "LWPOLYLINE_RECT": // raríssimo; mantido só por segurança
      case "RECT": {
        // Se não houver entidade específica de retângulo, ignore
        break;
      }
      default:
        // ignore outras entidades por enquanto (CIRCLE, ARC, etc.)
        break;
    }
  }
  return shapes;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Envie um arquivo DWG em 'file' (multipart/form-data)." }, { status: 400 });
    }

    const odaPath = resolveOdaConverterPath();
    if (!odaPath) {
      return NextResponse.json(
        { error: "ODA File Converter não encontrado. Defina a variável ODA_CONVERTER com o caminho do ODAFileConverter.exe." },
        { status: 500 }
      );
    }

    // Salva DWG em pasta temporária
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dwg-"));
    const dwgPath = path.join(tmpDir, (file as File).name || "input.dwg");
    const buf = Buffer.from(await (file as File).arrayBuffer());
    await fs.writeFile(dwgPath, buf);

    // ODA File Converter trabalha por diretório, gerando DXF no target.
    const outDir = path.join(tmpDir, "out");
    await fs.mkdir(outDir);

    // Parâmetros típicos do ODAFileConverter:
    // ODAFileConverter.exe <srcDir> <dstDir> <filter> <outVer> <recursive> <audit>
    // Exemplo: ODAFileConverter.exe C:\tmp\in C:\tmp\out "*.dwg" "DXF R2018" 0 0
    const args = [
      path.dirname(dwgPath),
      outDir,
      "*.dwg",
      "DXF R2018", // você pode trocar a versão desejada
      "0",         // recursive: 0 = não
      "0",         // audit: 0 = não
    ];

    // Executa conversão
    await pexecFile(`"${odaPath}"`, args, { windowsHide: true, shell: true });

    // Acha o DXF gerado (mesmo nome base)
    const base = path.basename(dwgPath, path.extname(dwgPath)) + ".dxf";
    const dxfPath = path.join(outDir, base);

    // Parseia DXF para shapes compatíveis com seu front
    const shapes = await parseDxfToShapes(dxfPath);

    // Limpeza best-effort (não bloqueante)
    setTimeout(() => fs.rm(tmpDir, { recursive: true, force: true }), 10_000);

    return NextResponse.json(shapes, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}
