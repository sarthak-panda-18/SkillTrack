'use client';

import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FileText, Upload, Trash2, Clock, CheckCircle2, AlertCircle, FileCheck, X, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface EmploymentDocumentsSectionProps {
  documents: any[];
  onUpload: (formData: FormData) => void;
  onDelete: (docId: string) => void;
  isUploading?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function EmploymentDocumentsSection({
  documents = [],
  onUpload,
  onDelete,
  isUploading,
}: EmploymentDocumentsSectionProps) {
  const [documentType, setDocumentType] = useState<string>('Offer Letter');
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    const allowedTypes = ['application/pdf', 'image/png'];
    const allowedExts = ['.pdf', '.png'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      toast.error('Only PDF and PNG files are supported.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 10 MB.');
      return;
    }

    setSelectedFile(file);
    if (!fileName) {
      setFileName(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a PDF or PNG document to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('documentType', documentType);
    formData.append('fileName', fileName || selectedFile.name);

    onUpload(formData);
    setSelectedFile(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Employment evidence uploaded! Sent for trainer review.');
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge variant="success" className="gap-1 text-[10px] font-mono font-bold uppercase"><CheckCircle2 className="h-3 w-3" /> VERIFIED</Badge>;
      case 'REJECTED':
        return <Badge variant="rose" className="gap-1 text-[10px] font-mono font-bold uppercase"><AlertCircle className="h-3 w-3" /> REJECTED</Badge>;
      case 'UNDER_REVIEW':
      case 'UPLOADED':
      default:
        return <Badge variant="default" className="gap-1 text-[10px] font-mono font-bold uppercase bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40"><Clock className="h-3 w-3" /> UNDER REVIEW</Badge>;
    }
  };

  return (
    <Card className="p-6 bg-[#0A0A0A] border-white/10 text-white rounded-sm">
      <CardHeader className="p-0 pb-4 border-b border-white/10 mb-4">
        <CardTitle className="font-condensed text-xl font-extrabold uppercase text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#FFD400]" />
          3. EMPLOYMENT DOCUMENTS & EVIDENCE
        </CardTitle>
        <CardDescription className="text-xs text-zinc-400 font-sans">
          Upload verified employment proof (Offer Letter, ID Card, Joining Letter) directly from your device for trainer verification.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 space-y-6">
        {/* Real File Upload Form */}
        <form onSubmit={handleSubmit} className="p-5 rounded-sm bg-[#111111] border border-white/10 space-y-4 text-xs font-sans">
          <div className="font-condensed font-extrabold text-sm uppercase tracking-wider text-[#FFD400] flex items-center gap-1.5">
            <Upload className="h-4 w-4 text-[#FFD400]" />
            UPLOAD NEW EMPLOYMENT DOCUMENT
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-mono font-bold text-zinc-300 uppercase block mb-1">Document Type *</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-sm border border-white/15 bg-black text-white font-mono text-xs focus:border-[#FFD400] focus:outline-none"
              >
                <option value="Offer Letter">Offer Letter</option>
                <option value="Internship Offer Letter">Internship Offer Letter</option>
                <option value="Joining Letter">Joining Letter</option>
                <option value="Employee ID Card">Employee ID Card</option>
                <option value="Experience Letter">Experience Letter</option>
                <option value="Other Employment Proof">Other Employment Proof</option>
              </select>
            </div>

            <div>
              <label className="font-mono font-bold text-zinc-300 uppercase block mb-1">Document Name / Title</label>
              <input
                type="text"
                placeholder="e.g. Offer_Letter_ABC_Technologies.pdf"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-sm border border-white/15 bg-black text-white font-mono text-xs focus:border-[#FFD400] focus:outline-none"
              />
            </div>
          </div>

          {/* Drag & Drop File Upload Area */}
          <div>
            <label className="font-mono font-bold text-zinc-300 uppercase block mb-1">Upload Employment Document *</label>

            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.png,application/pdf,image/png"
              onChange={handleFileChange}
              className="hidden"
            />

            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 rounded-sm border-2 border-dashed text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#FFD400] bg-[#FFD400]/10'
                    : 'border-white/20 bg-black hover:border-[#FFD400]/50'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-3 rounded-sm bg-[#171717] text-[#FFD400]">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-condensed font-bold text-white text-sm uppercase">
                      DRAG & DROP YOUR FILE HERE OR <span className="text-[#FFD400] underline">BROWSE</span>
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                      PDF OR PNG • MAXIMUM 10 MB
                    </p>
                  </div>
                  <Button type="button" size="sm" variant="outline" className="text-xs font-mono font-bold uppercase pointer-events-none mt-1 border-white/20 text-white">
                    Choose File
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-sm bg-[#FFD400]/10 border border-[#FFD400]/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-sm bg-[#FFD400] text-black font-bold">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-condensed font-extrabold text-white text-sm block truncate max-w-sm">
                      {selectedFile.name}
                    </span>
                    <span className="text-[10px] text-[#FFD400] font-mono">
                      {selectedFile.type || 'Document'} • {formatFileSize(selectedFile.size)}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null);
                    setFileName('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-rose-400 hover:bg-rose-950/40 hover:border-rose-500 text-xs shrink-0 gap-1 border-rose-500/30"
                >
                  <X className="h-3.5 w-3.5" /> Remove
                </Button>
              </div>
            )}
          </div>

          <Button
            type="submit"
            isLoading={isUploading}
            disabled={!selectedFile || isUploading}
            className="bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase tracking-wider gap-1.5 w-full sm:w-auto"
          >
            <Upload className="h-4 w-4" /> UPLOAD DOCUMENT PROOF
          </Button>
        </form>

        {/* Uploaded Documents List */}
        <div className="space-y-3">
          <h4 className="font-mono font-bold text-xs text-zinc-300 uppercase">
            Uploaded Documents ({documents.length})
          </h4>

          {documents.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 bg-[#111111] rounded-sm border border-dashed border-white/10 text-xs font-mono uppercase">
              No employment documents uploaded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc: any) => (
                <div
                  key={doc._id}
                  className="p-4 rounded-sm bg-[#111111] border border-white/10 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-condensed font-extrabold text-white text-base">{doc.fileName}</span>
                      <Badge variant="outline" className="text-[9px] font-mono font-bold uppercase border-white/20 text-zinc-300">{doc.documentType}</Badge>
                      {getStatusBadge(doc.verificationStatus)}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-mono">
                      <span>File: {doc.originalFileName || doc.fileName}</span>
                      {doc.fileSize && <span>• {formatFileSize(doc.fileSize)}</span>}
                      {doc.uploadedDate && <span>• Uploaded {new Date(doc.uploadedDate).toLocaleDateString()}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://localhost:5000${doc.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline" className="text-[#FFD400] hover:border-[#FFD400] text-xs gap-1 font-mono uppercase border-white/20">
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                      </a>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(doc._id)}
                      className="text-rose-400 hover:bg-rose-950/40 hover:border-rose-500 text-xs gap-1 font-mono uppercase border-rose-500/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

