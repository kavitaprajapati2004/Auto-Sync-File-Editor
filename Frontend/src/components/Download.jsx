import jsPDF from "jspdf";
import { LuDownload } from "react-icons/lu";


export default function Download({ title, content }) {
  const handleDownload = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(title || "Untitled File", 10, 15);

    doc.setFontSize(12);
    const lines = doc.splitTextToSize(content || "", 180);
    doc.text(lines, 10, 30);

    doc.save(`${title || "file"}.pdf`);
  };

  return (
   <button className="download-btn" onClick={handleDownload}><LuDownload id="dwl-btn" /></button>
  );
}
