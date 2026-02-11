import React, { useRef, useState } from "react";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Share2,
  Eye,
  PenLine,
  X,
  Search,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

type DocumentStatus = "Draft" | "In Review" | "Signed";

interface DocumentItem {
  id: number;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  status: DocumentStatus;
  fileUrl?: string;
}

const getFileType = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (ext === "pdf") return "PDF";
  if (ext === "doc" || ext === "docx") return "Document";
  if (ext === "xls" || ext === "xlsx") return "Spreadsheet";

  return "File";
};

const getStatusBadge = (status: DocumentStatus) => {
  if (status === "Draft") return <Badge variant="secondary">Draft</Badge>;
  if (status === "In Review") return <Badge variant="primary">In Review</Badge>;
  if (status === "Signed") return <Badge variant="success">Signed</Badge>;

  return null;
};

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: 1,
      name: "Pitch Deck 2024.pdf",
      type: "PDF",
      size: "2.4 MB",
      lastModified: "2024-02-15",
      shared: true,
      status: "Draft",
    },
    {
      id: 2,
      name: "Financial Projections.xlsx",
      type: "Spreadsheet",
      size: "1.8 MB",
      lastModified: "2024-02-10",
      shared: false,
      status: "In Review",
    },
    {
      id: 3,
      name: "Business Plan.docx",
      type: "Document",
      size: "3.2 MB",
      lastModified: "2024-02-05",
      shared: true,
      status: "Signed",
    },
    {
      id: 4,
      name: "Market Research.pdf",
      type: "PDF",
      size: "5.1 MB",
      lastModified: "2024-01-28",
      shared: false,
      status: "Draft",
    },
  ]);

  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [isSignOpen, setIsSignOpen] = useState(false);
  const [signDoc, setSignDoc] = useState<DocumentItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Search + Filter
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | DocumentStatus
  >("All");

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);

    const newDoc: DocumentItem = {
      id: Date.now(),
      name: file.name,
      type: getFileType(file.name),
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      lastModified: new Date().toISOString().split("T")[0],
      shared: false,
      status: "Draft",
      fileUrl,
    };

    setDocuments((prev) => [newDoc, ...prev]);
    event.target.value = "";
  };

  const handleDelete = (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this document?"
    );
    if (!confirmDelete) return;

    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleDownload = (doc: DocumentItem) => {
    if (!doc.fileUrl) {
      alert("This is a mock file. Upload a real file to download.");
      return;
    }

    const link = document.createElement("a");
    link.href = doc.fileUrl;
    link.download = doc.name;
    link.click();
  };

  const handleShare = (doc: DocumentItem) => {
    alert(`Shared "${doc.name}" successfully (Mock Feature).`);

    setDocuments((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, shared: true } : d))
    );
  };

  const handlePreview = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setSelectedDoc(null);
    setIsPreviewOpen(false);
  };

  const openSignature = (doc: DocumentItem) => {
    setSignDoc(doc);
    setIsSignOpen(true);

    setTimeout(() => {
      clearSignature();
    }, 100);
  };

  const closeSignature = () => {
    setSignDoc(null);
    setIsSignOpen(false);
  };

  const handleStatusChange = (id: number, status: DocumentStatus) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, status } : doc))
    );
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);

    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    if (!signDoc) return;

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === signDoc.id ? { ...doc, status: "Signed" } : doc
      )
    );

    alert(`Document "${signDoc.name}" signed successfully!`);
    closeSignature();
  };

  // FILTERED DOCUMENTS
  const filteredDocuments = documents.filter((doc) => {
    const matchSearch = doc.name.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter === "All" ? true : doc.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Chamber</h1>
          <p className="text-gray-600">
            Upload, preview, manage and sign contracts/deals
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            className="hidden"
            onChange={handleFileUpload}
          />

          <Button leftIcon={<Upload size={18} />} onClick={handleUploadClick}>
            Upload Document
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Storage */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Storage</h2>
          </CardHeader>

          <CardBody className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="font-medium text-gray-900">12.5 GB</span>
              </div>

              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-primary-600 rounded-full"
                  style={{ width: "65%" }}
                ></div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available</span>
                <span className="font-medium text-gray-900">7.5 GB</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Quick Access
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Recent Files
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Shared with Me
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Starred
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Trash
                </button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Documents */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search + Filter */}
          <Card>
            <CardBody className="flex flex-col md:flex-row gap-3 justify-between items-center">
              {/* Search */}
              <div className="relative w-full md:w-2/3">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search documents..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "All" | DocumentStatus)
                }
                className="w-full md:w-1/3 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="All">All Status</option>
                <option value="Draft">Draft</option>
                <option value="In Review">In Review</option>
                <option value="Signed">Signed</option>
              </select>
            </CardBody>
          </Card>

          {/* List */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">
                Deals / Contracts Documents
              </h2>
            </CardHeader>

            <CardBody>
              <div className="space-y-2">
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      <div className="p-2 bg-primary-50 rounded-lg mr-4">
                        <FileText size={24} className="text-primary-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {doc.name}
                          </h3>

                          {doc.shared && (
                            <Badge variant="secondary">Shared</Badge>
                          )}

                          {getStatusBadge(doc.status)}
                        </div>

                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                          <span>{doc.type}</span>
                          <span>{doc.size}</span>
                          <span>Modified {doc.lastModified}</span>

                          <select
                            value={doc.status}
                            onChange={(e) =>
                              handleStatusChange(
                                doc.id,
                                e.target.value as DocumentStatus
                              )
                            }
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm outline-none"
                          >
                            <option value="Draft">Draft</option>
                            <option value="In Review">In Review</option>
                            <option value="Signed">Signed</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          aria-label="Preview"
                          onClick={() => handlePreview(doc)}
                        >
                          <Eye size={18} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          aria-label="Sign"
                          onClick={() => openSignature(doc)}
                        >
                          <PenLine size={18} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          aria-label="Download"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download size={18} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          aria-label="Share"
                          onClick={() => handleShare(doc)}
                        >
                          <Share2 size={18} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-error-600 hover:text-error-700"
                          aria-label="Delete"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    No matching documents found.
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Preview: {selectedDoc.name}
              </h3>

              <button
                onClick={closePreview}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              {selectedDoc.type === "PDF" && selectedDoc.fileUrl ? (
                <iframe
                  src={selectedDoc.fileUrl}
                  className="w-full h-[500px] border rounded-lg"
                  title="PDF Preview"
                />
              ) : (
                <div className="text-gray-600 text-center py-20">
                  Preview available only for uploaded PDF files.
                  <br />
                  Download this file to view it.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {isSignOpen && signDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Sign Document: {signDoc.name}
              </h3>

              <button
                onClick={closeSignature}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Draw your signature below (Mock E-Signature).
              </p>

              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="border rounded-lg w-full bg-white cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={clearSignature}>
                  Clear
                </Button>

                <Button variant="secondary" onClick={closeSignature}>
                  Cancel
                </Button>

                <Button onClick={saveSignature}>Save Signature</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
