import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink, Video as VideoIcon } from "lucide-react";

/**
 * VideoTheaterModal
 * ------------------
 * Vista ampliada ("modo teatro", como YouTube) para un video embebido.
 * Se abre al hacer clic sobre la miniatura de un video en la cuadrícula
 * y se cierra con la X, la tecla Escape, o clic fuera del panel.
 *
 * Props:
 *  - open: boolean            -> controla si se muestra
 *  - onClose: () => void      -> callback para cerrar
 *  - videoSrc: string         -> URL del iframe (embed) ya validada
 *  - title: string            -> nombre del video / materia
 *  - description?: string     -> texto informativo debajo del video
 *  - externalUrl?: string     -> link "Ver en YouTube" (opcional)
 */
export const VideoTheaterModal = ({
  open,
  onClose,
  videoSrc,
  title,
  description,
  externalUrl,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !videoSrc) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] bg-[#020b04]/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={onClose}
      data-testid="video-theater-overlay"
    >
      <div
        className="w-full max-w-6xl bg-[#051a09] border border-[#c9a227]/30 rounded-xl shadow-[0_0_60px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[92vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        data-testid="video-theater-modal"
      >
        {/* Barra superior */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-[#c9a227]/20 bg-[#020b04]/60">
          <VideoIcon className="w-4 h-4 text-[#c9a227] shrink-0" />
          <h3 className="font-cinzel text-base sm:text-lg text-[#f4f1e1] truncate flex-1">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            data-testid="video-theater-close-btn"
            className="p-2 rounded-full hover:bg-[#c9a227]/10 text-[#c9a227] transition shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video en grande, formato teatro */}
        <div className="w-full bg-black aspect-video">
          <iframe
            src={videoSrc}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Info debajo del video */}
        {(description || externalUrl) && (
          <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
            {description && (
              <p className="font-cormorant text-base sm:text-lg text-[#a3b3a6] leading-relaxed">
                {description}
              </p>
            )}
            {externalUrl && (
              <a
                href={externalUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-sm border border-[#c9a227]/40 text-[#c9a227] hover:bg-[#c9a227]/10 transition-colors font-dm-sans text-xs tracking-widest uppercase"
                data-testid="video-theater-external-link"
              >
                Ver en YouTube <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
