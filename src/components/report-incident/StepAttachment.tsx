import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import casesService from '../../services/cases.service';

interface MediaFile {
    url: string;
    type: string;
    name: string;
}

interface StepProps {
    data: any;
    onChange: (data: any) => void;
    onBack: () => void;
    onNext: () => void;
    categoryName?: string;
    onSaveDraft?: (data?: any) => void;
    onDiscard?: () => void;
}

const StepAttachment: React.FC<StepProps> = ({ data, onChange, onBack, onNext, categoryName, onSaveDraft, onDiscard }) => {
    const { user } = useAuthStore();
    const [files, setFiles] = useState<File[]>(data.attachments || []);
    // ...

    const handleSaveDraftClick = () => {
        if (onSaveDraft) {
            onSaveDraft({
                attachments: files,
                media: uploadedMedia // Assuming uploadedMedia is available in scope
            });
        }
    };

    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [uploadedMedia, setUploadedMedia] = useState<MediaFile[]>(data.media || []);

    const isSecurityBreach = categoryName === 'Security Breach';

    useEffect(() => {
        setFiles(data.attachments || []);
        setUploadedMedia(data.media || []);
    }, [data.attachments, data.media]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const updatedFiles = [...files, ...newFiles];
            setFiles(updatedFiles);
            onChange({ attachments: updatedFiles });

            // Start background uploads
            for (const file of newFiles) {
                const fileId = `${file.name}-${file.size}-${file.lastModified}`;
                setUploading(prev => ({ ...prev, [fileId]: true }));

                try {
                    const result = await casesService.uploadFile(file, data.id);
                    const newMedia = {
                        url: result.url,
                        type: result.type,
                        name: file.name,
                        uploadedById: user?.id,
                        uploaderRole: user?.role?.name || 'Employee'
                    };

                    setUploadedMedia(prev => {
                        const updated = [...prev, newMedia];
                        onChange({ media: updated });
                        return updated;
                    });
                } catch (error) {
                    console.error('Upload failed for file:', file.name, error);
                    alert(`Failed to upload ${file.name}. Please try again.`);
                } finally {
                    setUploading(prev => ({ ...prev, [fileId]: false }));
                }
            }
        }
    };

    const removeFile = (index: number) => {
        if (window.confirm('Are you sure you want to delete this attachment?')) {
            const fileToRemove = files[index];
            const updatedFiles = files.filter((_, i) => i !== index);
            setFiles(updatedFiles);

            // Also remove from uploaded media if it was uploaded
            const updatedMedia = uploadedMedia.filter(m => m.name !== fileToRemove.name);
            setUploadedMedia(updatedMedia);

            onChange({
                attachments: updatedFiles,
                media: updatedMedia
            });
        }
    };

    const isUploadingAny = Object.values(uploading).some(val => val);
    const isNextDisabled = (isSecurityBreach && uploadedMedia.length === 0) || isUploadingAny;

    return (
        <div className="animate-fadeIn">
            <div className="mb-10">
                <span className="text-sm font-bold text-gray-400 mb-1 block">Step 4/5</span>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">Attachments</h3>
                <p className="text-gray-500 font-medium">Upload photos/videos (if safe) {isSecurityBreach ? '*' : ''}</p>
                <div className="h-[1px] bg-gray-100 w-full mt-6" />
            </div>

            <div className="mt-8">
                <div className="w-full">
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500">Photos, Videos, Documents</p>
                        </div>
                        <input type="file" className="hidden" multiple onChange={handleFileChange} disabled={isUploadingAny} />
                    </label>

                    {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {files.map((file, index) => {
                                const fileId = `${file.name}-${file.size}-${file.lastModified}`;
                                const isFileUploading = uploading[fileId];
                                const isUploaded = uploadedMedia.some(m => m.name === file.name);

                                return (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group transition-colors duration-200">
                                        <div className="flex items-center gap-3">
                                            {isFileUploading ? (
                                                <Loader2 size={18} className="animate-spin text-blue-500" />
                                            ) : isUploaded ? (
                                                <CheckCircle2 size={18} className="text-green-500" />
                                            ) : (
                                                <AlertCircle size={18} className="text-amber-500" />
                                            )}
                                            <span className="text-sm text-gray-700 font-medium">{file.name}</span>
                                        </div>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="p-2 rounded-full bg-red hover:bg-red/90 text-white transition-all duration-200"
                                            title="Delete attachment"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between mt-16 pt-8 border-t border-gray-100">
                <div className="flex gap-8">
                    <button
                        onClick={handleSaveDraftClick}
                        className="text-gray-600 font-bold hover:text-gray-900 transition-colors"
                    >
                        Save as Draft
                    </button>
                    <button
                        onClick={onDiscard}
                        className="text-gray-600 font-bold hover:text-gray-900 transition-colors"
                    >
                        Discard
                    </button>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={onBack}
                        className="px-8 py-2.5 bg-light-green rounded-lg font-bold "
                    >
                        Previous
                    </button>
                    <button
                        onClick={onNext}
                        disabled={isNextDisabled}
                        className="px-8 py-2.5 bg-green text-white rounded-lg font-bold shadow-sm transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 flex items-center gap-2"
                    >
                        {isUploadingAny && <Loader2 size={18} className="animate-spin" />}
                        {isUploadingAny ? 'Uploading...' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StepAttachment;
