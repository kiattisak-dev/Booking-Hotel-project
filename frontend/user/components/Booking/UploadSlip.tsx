import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileImage } from 'lucide-react';
import { th } from '@/lib/i18n';

interface UploadSlipProps {
  onFileSelect: (file: File | null) => void;
  currentFile?: File | null;
}

export default function UploadSlip({ onFileSelect, currentFile }: UploadSlipProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพ');
        return;
      }

      onFileSelect(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Label>{th.paymentSlip}</Label>
      
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={preview}
                alt="Payment slip preview"
                className="w-full h-64 object-contain border rounded"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {currentFile?.name}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div
          onClick={handleUploadClick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {th.uploadSlip}
          </p>
          <p className="text-gray-600 mb-4">
            คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง
          </p>
          <Button type="button">
            <Upload className="h-4 w-4 mr-2" />
            เลือกไฟล์
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            รองรับ PNG, JPG, JPEG (สูงสุด 5MB)
          </p>
        </div>
      )}
    </div>
  );
}