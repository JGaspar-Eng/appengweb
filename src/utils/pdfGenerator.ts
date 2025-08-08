import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function gerarPDF(elementId: string, nomeArquivo: string = "relatorio-laje.pdf") {
  const element = document.getElementById(elementId);
  if (!element) return;
  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pageWidth;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(nomeArquivo);
}
