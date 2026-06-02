import React, { useState } from "react";
import { Copy, Check, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ProfilePhotoUploader({ user, onPhotoUpdate, uploading = false }) {
  const [photoUrl, setPhotoUrl] = useState(user?.profile_photo_url || "");
  const [preview, setPreview] = useState(user?.profile_photo_url || "");
  const [copied, setCopied] = useState(false);

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPhotoUrl(url);
    if (isValidGoogleDriveUrl(url)) {
      setPreview(convertGoogleDriveUrl(url));
    }
  };

  const isValidGoogleDriveUrl = (url) => {
    if (!url) return false;
    return url.includes("drive.google.com") || url.includes("lh3.googleusercontent.com");
  };

  const convertGoogleDriveUrl = (url) => {
    if (url.includes("drive.google.com")) {
      const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}=s200`;
      }
    }
    return url;
  };

  const handleSave = async () => {
    if (!photoUrl.trim()) {
      toast.error("Por favor ingresa una URL");
      return;
    }
    if (!isValidGoogleDriveUrl(photoUrl)) {
      toast.error("Usa un enlace válido de Google Drive");
      return;
    }
    await onPhotoUpdate(photoUrl);
    toast.success("Foto de perfil guardada");
  };

  const handleCopyInstructions = () => {
    const text = `Instrucciones:\n1. Sube una imagen a Google Drive\n2. Haz clic derecho → Compartir\n3. Cambia a "Cualquiera con el enlace"\n4. Copia el enlace y pégalo aquí`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#020b04]/40 border border-[#c9a227]/15 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-dm-sans text-sm font-semibold text-[#c9a227]">
          Foto de Perfil
        </h3>
        <button
          onClick={handleCopyInstructions}
          className="flex items-center gap-2 text-xs text-[#a3b3a6] hover:text-[#c9a227] transition-colors"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copiado" : "Instrucciones"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Preview */}
        <div className="flex flex-col items-center justify-center">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-24 h-24 rounded-full object-cover border-2 border-[#c9a227]/30"
              onError={() => setPreview("")}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#051a09] border-2 border-[#c9a227]/20 flex items-center justify-center text-[#a3b3a6] text-xs text-center px-2">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "?"}
            </div>
          )}
          <p className="text-xs text-[#a3b3a6] mt-2 text-center">
            {preview ? "Previsualización" : "Sin foto"}
          </p>
        </div>

        {/* URL Input */}
        <div className="sm:col-span-2 flex flex-col gap-3">
          <div>
            <label className="block font-dm-sans text-[10px] tracking-widest uppercase text-[#c9a227]/80 mb-1.5">
              Enlace de Google Drive
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              value={photoUrl}
              onChange={handleUrlChange}
              disabled={uploading}
              className="w-full bg-black/40 border border-[#c9a227]/20 rounded-sm px-3 py-2.5 text-sm font-dm-sans text-white placeholder-[#a3b3a6]/40 focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] disabled:opacity-60"
            />
            <p className="text-xs text-[#a3b3a6] mt-1.5 flex items-start gap-1">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>
                Comparte el archivo en Google Drive y asegúrate que sea público
              </span>
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={uploading || !photoUrl.trim()}
            className="flex items-center justify-center gap-2 bg-[#c9a227] hover:bg-[#d4b234] disabled:bg-[#c9a227]/50 text-[#051a09] font-dm-sans font-semibold py-2.5 rounded-sm transition-colors disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Foto"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
