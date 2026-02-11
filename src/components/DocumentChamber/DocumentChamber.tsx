import React, { useRef, useState } from "react";
import { FileText, Upload, PenTool, Trash2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

type DocStatus = "Draft" | "In Review" | "Signed";

interface UploadedDoc {
  name: string;
  type: string;
  url: string;
  status: DocStatus;
}

export const DocumentChamber: React.FC = () => {
  const [doc, setDoc] = useState<UploadedDoc | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    setDoc({
      name: file.name,
      type: file.type,
      url,
      status: "Draft",
    });

    setSignature(null);
  };

  const updateStatus = (status: DocStatus) => {
    if (!doc) return;
    setDoc({ ...doc, status });
  };

  const getBadgeVariant = (status: DocStatus) => {
    if (status === "Draft") return "gray";
    if (status === "In Review") return "primary";
    return "success";
  };

  // =======================
  // Signature Pad Logic
  // =======================
  const getMousePos = (canvas: HTMLCanvasElement, e: any) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX || e.touches?.[0]?.clientX) - rect.left,
      y: (e.clientY || e.touches?.[0]?.clientY) - rect.top,
    };
  };

  const startDrawing = (e: any) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getMousePos(canvas, e);

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: any) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getMousePos(canvas, e);

    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  const saveSignature = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const data = canvas.toDataURL("image/png");
    setSignature(data);

    if (doc) {
      setDoc({ ...doc, status: "Signed" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Chamber</h1>
          <p className="text-gray-600">
            Upload contracts, preview documents, and sign digitally.
          </p>
        </div>

        <label className="cursor-pointer">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleUpload}
          />

          <Button leftIcon={<Upload size={18} />}>Upload Document</Button>
        </label>
      </div>

      {/* Document Info */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={20} /> Document Preview
          </h2>

          {doc ? (
            <Badge variant={getBadgeVariant(doc.status)}>{doc.status}</Badge>
          ) : (
            <Badge variant="gray">No File</Badge>
          )}
        </CardHeader>

        <CardBody>
          {doc ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-600">File Name</p>
                  <p className="font-medium text-gray-900">{doc.name}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => updateStatus("Draft")}
                  >
                    Draft
                  </Button>

                  <Button
                    variant="accent"
                    onClick={() => updateStatus("In Review")}
                  >
                    In Review
                  </Button>

                  <Button variant="success" onClick={() => updateStatus("Signed")}>
                    Signed
                  </Button>
                </div>
              </div>

              {/* PDF Preview */}
              {doc.type === "application/pdf" ? (
                <div className="border rounded-xl overflow-hidden">
                  <iframe
                    src={doc.url}
                    className="w-full h-[500px]"
                    title="PDF Preview"
                  />
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border rounded-xl">
                  <p className="text-gray-700">
                    Preview not supported for this file type.
                  </p>

                  <a
                    href={doc.url}
                    download={doc.name}
                    className="text-primary-600 font-medium hover:underline"
                  >
                    Download Document
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600">Upload a document to preview here.</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Signature Section */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <PenTool size={20} /> E-Signature Pad
          </h2>

          {signature ? (
            <Badge variant="success">Signature Saved</Badge>
          ) : (
            <Badge variant="gray">Not Signed</Badge>
          )}
        </CardHeader>

        <CardBody>
          <div className="space-y-4">
            <div className="border rounded-xl overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={800}
                height={200}
                className="w-full h-[200px] bg-white cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant="secondary"
                leftIcon={<Trash2 size={18} />}
                onClick={clearSignature}
              >
                Clear
              </Button>

              <Button
                variant="success"
                leftIcon={<PenTool size={18} />}
                onClick={saveSignature}
                disabled={!doc}
              >
                Save Signature
              </Button>
            </div>

            {!doc && (
              <p className="text-center text-sm text-gray-500">
                Upload a document first to sign it.
              </p>
            )}

            {signature && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Saved Signature:</p>
                <img
                  src={signature}
                  alt="signature"
                  className="mx-auto border rounded-lg p-2 bg-gray-50"
                />
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DocumentChamber;
