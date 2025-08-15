import { NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import { promisify } from "util";
import path from "path";
import { parseStringPromise } from "xml2js";
import { exec as execCb } from "child_process";

const exec = promisify(execCb);

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    const form = formidable({ multiples: false });
    const [fields, files] = await new Promise<any>((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.file[0];
    const tempPath = file.filepath;
    const uploadDir = path.join(process.cwd(), "imports_dwg");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const savedPath = path.join(uploadDir, file.originalFilename);
    fs.renameSync(tempPath, savedPath);

    // Ajuste de escala via INSUNITS para cm
    const scaledPath = path.join(uploadDir, `scaled_${file.originalFilename}`);
    await exec(`dxfconverter "${savedPath}" "${scaledPath}" --units cm`);

    return NextResponse.json({
      success: true,
      message: "Arquivo importado e convertido para cm com sucesso.",
      filePath: scaledPath,
    });
  } catch (error: any) {
    console.error("Erro no importador DXF:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
