import { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';

const ImageUploader = ({ currentImage, onImageChange }) => {
    const [preview, setPreview] = useState(currentImage || null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                alert('Por favor selecciona una imagen válida');
                return;
            }

            // Validar tamaño (máximo 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('La imagen no debe superar los 2MB');
                return;
            }

            // Convertir a base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setPreview(base64String);
                onImageChange(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setPreview(null);
        onImageChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                    {preview ? (
                        <img
                            src={preview}
                            alt="Foto de perfil"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600">
                            <Camera className="w-12 h-12 text-white" />
                        </div>
                    )}
                </div>
                
                {preview && (
                    <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                        title="Eliminar foto"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                >
                    <Camera className="w-4 h-4" />
                    {preview ? 'Cambiar foto' : 'Subir foto'}
                </button>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            <p className="text-xs text-gray-500 text-center">
                JPG, PNG o GIF. Máximo 2MB
            </p>
        </div>
    );
};

export default ImageUploader;