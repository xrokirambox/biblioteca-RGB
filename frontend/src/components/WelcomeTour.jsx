import React, { useEffect, useState } from "react";
import { BookOpen, Search, ShoppingCart, Sparkles, X } from "lucide-react";

const TOUR_STORAGE_KEY = "rgb-library-welcome-tour-completed";

const STEPS = [
  {
    icon: Sparkles,
    eyebrow: "Bienvenido a Biblioteca RGB",
    title: "Todo tu material escolar, en un solo lugar",
    description: "En menos de un minuto te mostramos cómo encontrar recursos, guardarlos y estudiar con ellos.",
  },
  {
    icon: BookOpen,
    eyebrow: "1. Explora la biblioteca",
    title: "Elige tu salón y materia",
    description: "Pulsa Biblioteca o Explorar salones para ver las materias disponibles. Abre cada recurso desde su tarjeta.",
  },
  {
    icon: Search,
    eyebrow: "2. Encuentra más rápido",
    title: "Usa el buscador",
    description: "Escribe el título de un libro, un autor o una materia. Los resultados aparecen en la sección de libros y recursos.",
  },
  {
    icon: ShoppingCart,
    eyebrow: "3. Estudia con tus recursos",
    title: "Guarda libros en el carrito",
    description: "Usa el ícono de carrito en una tarjeta. Después abre Carrito para copiar las fuentes y llevarlas a NotebookLM.",
  },
];

export const hasCompletedWelcomeTour = () => {
  try {
    return window.localStorage.getItem(TOUR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

export const WelcomeTour = ({ open, onClose }) => {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current?.icon || Sparkles;
  const isIntro = step === 0;
  const isLast = step === STEPS.length - 1;

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#020b04]/85 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="welcome-tour-title">
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-[#c9a227]/35 bg-[#051a09] p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)] animate-scale-in">
        <button type="button" onClick={onClose} aria-label="Saltar recorrido" className="absolute right-4 top-4 rounded-full p-2 text-[#a3b3a6] transition hover:bg-[#c9a227]/10 hover:text-[#c9a227]">
          <X className="h-5 w-5" />
        </button>
        <div className="mb-6 flex gap-2" aria-label={`Paso ${step + 1} de ${STEPS.length}`}>
          {STEPS.map((_, index) => <span key={index} className={`h-1 flex-1 rounded-full ${index <= step ? "bg-[#c9a227]" : "bg-white/10"}`} />)}
        </div>
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a227]/35 bg-[#c9a227]/10">
          <Icon className="h-7 w-7 text-[#c9a227]" />
        </div>
        <p className="font-dm-sans text-[11px] uppercase tracking-[0.22em] text-[#c9a227]">{current.eyebrow}</p>
        <h2 id="welcome-tour-title" className="mt-3 font-cinzel text-3xl leading-tight text-[#f4f1e1]">{current.title}</h2>
        <p className="mt-4 font-cormorant text-xl leading-relaxed text-[#a3b3a6]">{current.description}</p>
        <div className="mt-8 flex items-center justify-between gap-4">
          <button type="button" onClick={onClose} className="font-dm-sans text-xs uppercase tracking-widest text-[#a3b3a6] transition hover:text-[#f4f1e1]">
            {isIntro ? "Saltar guía" : "Omitir recorrido"}
          </button>
          <button type="button" onClick={() => isLast ? onClose() : setStep((value) => value + 1)} className="btn-gold rounded-sm px-5 py-3 font-dm-sans text-xs font-semibold uppercase tracking-widest">
            {isIntro ? "Empezar recorrido" : isLast ? "¡Entendido!" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
};
