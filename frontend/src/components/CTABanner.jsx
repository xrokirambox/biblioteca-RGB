import React from "react";
import { ArrowRight } from "lucide-react";

export const CTABanner = ({ onOpenLibrary }) => {
  return (
    <section data-testid="cta-banner" className="py-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-2xl glass-strong p-12 sm:p-16 text-center grain">
          <div
            className="absolute inset-0 opacity-10 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.pexels.com/photos/4046683/pexels-photo-4046683.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')",
            }}
          />
          <div className="relative">
            <div className="font-dm-sans text-xs tracking-[0.3em] uppercase text-[#c9a227]/80 mb-4">
              Accede a tu biblioteca
            </div>
            <h2 className="font-cinzel text-4xl sm:text-5xl text-[#f4f1e1] max-w-2xl mx-auto leading-tight">
              Organiza tus recursos por{" "}
              <span className="text-[#c9a227] italic font-cormorant">grado y materia</span>
            </h2>
            <p className="mt-6 font-cormorant text-xl text-[#a3b3a6] max-w-2xl mx-auto">
              accede desde cualquier dispositivo.
            </p>
            <button
              onClick={onOpenLibrary}
              data-testid="cta-banner-btn"
              className="btn-gold mt-10 inline-flex items-center gap-3 px-8 py-4 rounded-sm font-dm-sans text-sm font-semibold tracking-wider uppercase"
            >
              Empezar ahora
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
