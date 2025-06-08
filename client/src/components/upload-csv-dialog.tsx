import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface UploadCSVDialogProps {
  weddingId: number;
}

export function UploadCSVDialog({ weddingId }: UploadCSVDialogProps) {
  const [open, setOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadResult, setUploadResult] = useState<{ message: string; guests?: any[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/weddings/${weddingId}/guests/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setUploadStatus('success');
      setUploadResult(data);
      queryClient.invalidateQueries({ queryKey: [`/api/weddings/${weddingId}/guests`] });
      queryClient.invalidateQueries({ queryKey: [`/api/weddings/${weddingId}/stats`] });
      toast({
        title: "Upload Successful",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      setUploadStatus('error');
      setUploadResult({ message: error.message });
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }
    
    setUploadStatus('uploading');
    uploadMutation.mutate(file);
  };

  const resetDialog = () => {
    setUploadStatus('idle');
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(resetDialog, 300); // Reset after dialog closes
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-blush-200 text-gray-700 border-blush-300 hover:bg-blush-300">
          <Upload className="w-4 h-4 mr-2" />
          Upload CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-playfair">Upload Guest List</DialogTitle>
        </DialogHeader>
        
        {uploadStatus === 'idle' && (
          <div className="space-y-4">
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-gold-400 bg-gold-50' 
                  : 'border-blush-200 hover:border-blush-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileText className="w-12 h-12 text-blush-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-800 mb-2">
                Drop your CSV file here
              </p>
              <p className="text-sm text-gray-600 mb-4">
                or click to browse your files
              </p>
              <Button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="gold-gradient text-white"
              >
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
            
            <Card className="bg-blush-50 border-blush-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-gray-800 mb-2">CSV Format Requirements:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Required columns: firstName, lastName, phone</li>
                  <li>• Optional columns: email, address, notes</li>
                  <li>• First row should contain column headers</li>
                  <li>• Save file as CSV format (.csv)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
        
        {uploadStatus === 'uploading' && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-800">Uploading guests...</p>
            <p className="text-sm text-gray-600">Please wait while we process your file</p>
          </div>
        )}
        
        {uploadStatus === 'success' && uploadResult && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-800 mb-2">Upload Successful!</p>
            <p className="text-sm text-gray-600 mb-4">{uploadResult.message}</p>
            <Button onClick={() => setOpen(false)} className="gold-gradient text-white">
              Close
            </Button>
          </div>
        )}
        
        {uploadStatus === 'error' && uploadResult && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-800 mb-2">Upload Failed</p>
            <p className="text-sm text-gray-600 mb-4">{uploadResult.message}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={resetDialog}>
                Try Again
              </Button>
              <Button onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
