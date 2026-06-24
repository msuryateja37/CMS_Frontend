import React, { useState, useRef } from 'react';
import { Upload, FileText, Eye, Trash2, Loader2 } from 'lucide-react';
import { invoiceService } from '../../services/invoiceService';

interface InvoiceUploadProps {
    onUploadComplete: () => void;
}

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const InvoiceUpload: React.FC<InvoiceUploadProps> = ({ onUploadComplete }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = async (file: File) => {
        setUploadedFile({ name: file.name, size: formatFileSize(file.size) });
        setIsProcessing(true);
        setUploadError(null);

        try {
            const data = await invoiceService.ocrScan(file);
            console.log('OCR Scan Response:', data);

            setIsProcessing(false);
            onUploadComplete();
        } catch (error: any) {
            console.error('OCR Scan Error:', error);
            setIsProcessing(false);
            const message = error?.response?.data?.message || error?.message || 'Failed to process invoice';
            setUploadError(message);
        }
    };

    const removeFile = () => {
        setUploadedFile(null);
        setIsProcessing(false);
        setUploadError(null);
        // Reset the file input so the same file can be re-selected
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Supporting Documents</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Uploaded files list */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                        Uploaded Files ({uploadedFile ? 1 : 0})
                    </h3>

                    {uploadedFile ? (
                        <div className="flex items-center justify-between p-4 bg-subtle-grey rounded-xl border border-semi-subtle-grey">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-light-gold rounded-lg flex items-center justify-center">
                                    <FileText size={20} className="text-brown" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{uploadedFile.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {uploadedFile.size} • {isProcessing ? (
                                            <span className="text-yellow font-semibold">PROCESSING OCR...</span>
                                        ) : uploadError ? (
                                            <span className="text-red font-semibold">ERROR</span>
                                        ) : (
                                            <span className="text-gold font-semibold">OCR PROCESSED</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isProcessing ? (
                                    <Loader2 size={18} className="text-brown animate-spin" />
                                ) : (
                                    <>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-brown">
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={removeFile}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-500 hover:text-red"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            No files uploaded yet
                        </div>
                    )}

                    {/* Error message */}
                    {uploadError && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs text-red-600 font-medium">{uploadError}</p>
                            <button
                                onClick={removeFile}
                                className="text-xs text-red-500 underline mt-1 hover:text-red-700"
                            >
                                Try again
                            </button>
                        </div>
                    )}
                </div>

                {/* Drag & drop zone */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !uploadedFile && fileInputRef.current?.click()}
                    className={`
                        border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                        ${isDragging
                            ? 'border-gold bg-gold/5 scale-[1.02]'
                            : 'border-gray-300 bg-subtle-grey hover:border-gold/50 hover:bg-gold/5'
                        }
                        ${uploadedFile ? 'opacity-60 pointer-events-none' : ''}
                    `}
                >
                    <div className="w-14 h-14 bg-light-gold rounded-2xl flex items-center justify-center mb-4">
                        <Upload size={24} className="text-brown" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                        Drag and drop more files here
                    </p>
                    <p className="text-xs text-gray-500 mb-1">
                        or <span className="text-brown font-semibold underline">browse from computer</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2">
                        PDF, PNG, JPG (MAX: 10MB)
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                </div>
            </div>

            {/* Processing skeleton */}
            {isProcessing && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                        <Loader2 size={20} className="text-gold animate-spin" />
                        <span className="text-sm font-semibold text-brown">
                            Smart Scanner processing invoice...
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="h-3 w-24 bg-gray-200 rounded" />
                            <div className="h-10 bg-gray-100 rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-20 bg-gray-200 rounded" />
                            <div className="h-10 bg-gray-100 rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-28 bg-gray-200 rounded" />
                            <div className="h-10 bg-gray-100 rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-32 bg-gray-200 rounded" />
                            <div className="h-10 bg-gray-100 rounded-lg" />
                        </div>
                    </div>
                    <div className="h-20 bg-gray-100 rounded-lg mt-4" />
                </div>
            )}
        </div>
    );
};

export default InvoiceUpload;
