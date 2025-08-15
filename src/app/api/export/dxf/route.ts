import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileName, dxfContent } = body;

    if (!fileName || !dxfContent) {
      return NextResponse.json(
        { success: false, error: "Parâmetros inválidos" },
        { status: 400 }
      );
    }

    const exportDir = path.join(process.cwd(), "exports_dwg");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filePath = path.join(exportDir, `${fileName}.dxf`);
    fs.writeFileSync(filePath, dxfContent, "utf8");

    return NextResponse.json({
      success: true,
      message: "Arquivo DXF exportado com sucesso.",
      filePath,
    });
  } catch (error: any) {
    console.error("Erro no exportador DXF:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
