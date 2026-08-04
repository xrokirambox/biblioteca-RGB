import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Award, Code2, Database, ExternalLink, Github, GraduationCap, Network, ShieldCheck, X } from "lucide-react";

const SKILLS = [
  ["HTML / CSS", "Avanzado"], ["JavaScript", "Intermedio"], ["Redes TCP/IP", "Avanzado"],
  ["Ciberseguridad", "Intermedio"], ["Bases de datos", "Intermedio"], ["Telecomunicaciones", "Experto"],
];

const EXPERIENCE = [
  ["Ago 2022 – Abr 2023", "AUDICOL SAS", "Técnico en Sistemas", "Monitoreo de seguridad informática, dispositivos de red, desarrollo de aplicaciones e integración de datos."],
  ["May 2021 – Mar 2022", "AUDICOL SAS", "Técnico en Sistemas", "Mantenimiento de infraestructura tecnológica, redes inalámbricas, pruebas de software y soporte a usuarios."],
  ["Oct 2018 – Mar 2019", "Fiscalía General de la Nación", "Técnico en Sistemas", "Red física de datos, configuración de dispositivos activos y seguridad de la información."],
  ["Jun 2023 – Dic 2023", "Software Quality Assurance S.A.", "Analista de Sistemas · Práctica", "Atención a clientes, integración de datos, medición de riesgos y sistematización de datos."],
];

const EDUCATION = [
  ["En curso", "Ingeniería en Sistemas", "Universidad del Magdalena"],
  ["Graduado", "Formación Front End G7 – ONE", "Alura Latam"],
  ["Graduado", "Tecnología en Análisis y Desarrollo de Sistemas", "SENA"],
  ["Graduado", "Técnico en Redes y Telecomunicaciones", "Universidad del Magdalena"],
  ["Graduado", "Técnico en Sistemas", "SENA"],
];

const PROJECT_FEATURES = [
  [Database, "Catálogo dinámico", "Libros, categorías y recursos administrables desde un panel protegido."],
  [Network, "Ruta académica", "Organización por categorías, subcategorías y materiales generales."],
  [Code2, "Recursos integrados", "Visualización de videos y PDFs embebidos sin duplicar enlaces."],
  [ShieldCheck, "Gestión segura", "Accesos por rol, auditoría de cambios y experiencia responsive."],
];

export const CreatorModal = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKeyDown); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] bg-[#020b04]/95 backdrop-blur-md p-2 sm:p-5 animate-fade-in" role="dialog" aria-modal="true" aria-label="Perfil del creador" onClick={onClose} data-testid="creator-modal-overlay">
      <article className="relative mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-xl border border-[#c9a227]/30 bg-[#051a09] shadow-[0_0_60px_rgba(0,0,0,.85)]" onClick={(event) => event.stopPropagation()} data-testid="creator-modal">
        <header className="flex shrink-0 items-center gap-3 border-b border-[#c9a227]/20 bg-[#020b04]/70 px-4 py-3 sm:px-6">
          <div className="flex-1 min-w-0">
            <p className="font-dm-sans text-[10px] uppercase tracking-[.25em] text-[#c9a227]">Perfil del creador</p>
            <h2 className="font-cinzel text-base sm:text-xl text-[#f4f1e1] truncate">Julian Guardiola Suarez</h2>
          </div>
          <a href="https://github.com/xrokirambox" target="_blank" rel="noreferrer" className="hidden sm:inline-flex btn-outline-gold items-center gap-2 rounded-sm px-3 py-2 font-dm-sans text-[10px] uppercase tracking-widest"><Github className="w-4 h-4" /> GitHub</a>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[#c9a227] hover:bg-[#c9a227]/10" aria-label="Cerrar perfil" data-testid="creator-modal-close"><X className="w-5 h-5" /></button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
          <section className="relative overflow-hidden border-b border-[#c9a227]/10 px-5 py-10 sm:px-10 sm:py-14">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#c9a227]/10 blur-3xl" />
            <div className="relative max-w-3xl">
              <p className="font-dm-sans text-xs uppercase tracking-[.3em] text-[#c9a227]/80">Soluciones Tecnológicas</p>
              <h1 className="mt-3 font-cinzel text-3xl leading-tight text-[#f4f1e1] sm:text-5xl">Tecnología con <span className="font-cormorant italic text-[#c9a227]">propósito</span></h1>
              <p className="mt-5 font-cormorant text-lg leading-relaxed text-[#a3b3a6] sm:text-xl">Ingeniero de Sistemas en formación, desarrollador Full Stack y profesional de redes. Más de tres años de experiencia práctica en soporte técnico, infraestructura, telecomunicaciones y desarrollo de software.</p>
              <div className="mt-6 flex flex-wrap gap-2 font-dm-sans text-xs uppercase tracking-wider text-[#f4f1e1]">
                {["3+ años de experiencia", "5+ empresas", "6+ certificaciones", "327+ horas de formación"].map((item) => <span key={item} className="rounded-full border border-[#c9a227]/25 bg-black/20 px-3 py-2">{item}</span>)}
              </div>
            </div>
          </section>

          <div className="space-y-12 px-5 py-9 sm:px-10 sm:py-12">
            <section>
              <p className="font-dm-sans text-xs uppercase tracking-[.25em] text-[#c9a227]">Sobre mí</p>
              <h3 className="mt-2 font-cinzel text-2xl text-[#f4f1e1]">Julian David Guardiola Suarez</h3>
              <p className="mt-4 max-w-4xl font-dm-sans text-sm leading-7 text-[#a3b3a6]">Profesional nacido en Santa Marta, Colombia, fundador de Soluciones Tecnológicas y actualmente estudiante de Ingeniería en Sistemas en la Universidad del Magdalena. Su enfoque combina desarrollo web, infraestructura de redes, seguridad IT, análisis de datos y soporte técnico.</p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PROJECT_FEATURES.map(([Icon, title, text]) => <div key={title} className="rounded-lg border border-white/5 bg-black/20 p-4"><Icon className="h-5 w-5 text-[#c9a227]" /><h4 className="mt-3 font-dm-sans text-sm text-[#f4f1e1]">{title}</h4><p className="mt-1 font-dm-sans text-xs leading-relaxed text-[#a3b3a6]">{text}</p></div>)}
            </section>

            <section className="grid gap-8 lg:grid-cols-2">
              <div><p className="font-dm-sans text-xs uppercase tracking-[.25em] text-[#c9a227]">Competencias</p><h3 className="mt-2 font-cinzel text-2xl text-[#f4f1e1]">Herramientas y tecnologías</h3><div className="mt-5 grid gap-2 sm:grid-cols-2">{SKILLS.map(([skill, level]) => <div key={skill} className="flex items-center justify-between gap-3 rounded-md border border-white/5 bg-black/20 px-3 py-3"><span className="font-dm-sans text-sm text-[#f4f1e1]">{skill}</span><span className="font-dm-sans text-[10px] uppercase tracking-wider text-[#c9a227]">{level}</span></div>)}</div></div>
              <div><p className="font-dm-sans text-xs uppercase tracking-[.25em] text-[#c9a227]">Proyecto destacado</p><h3 className="mt-2 font-cinzel text-2xl text-[#f4f1e1]">Biblioteca Escolar RGB</h3><p className="mt-4 font-dm-sans text-sm leading-7 text-[#a3b3a6]">Plataforma educativa para centralizar libros, enlaces y recursos institucionales. Incluye gestión de catálogo, jerarquía académica, buscador global, materiales generales y visualización integrada de PDF y video.</p><div className="mt-5 rounded-lg border border-[#c9a227]/20 bg-[#c9a227]/5 p-4"><Award className="h-5 w-5 text-[#c9a227]" /><p className="mt-2 font-dm-sans text-sm text-[#f4f1e1]">Diseñado a la medida para una experiencia educativa ordenada y administrable.</p></div></div>
            </section>

            <section><p className="font-dm-sans text-xs uppercase tracking-[.25em] text-[#c9a227]">Trayectoria</p><h3 className="mt-2 font-cinzel text-2xl text-[#f4f1e1]">Experiencia laboral</h3><div className="mt-5 space-y-3">{EXPERIENCE.map(([date, company, role, detail]) => <div key={`${date}-${company}`} className="grid gap-2 rounded-lg border border-white/5 bg-black/20 p-4 sm:grid-cols-[10rem_1fr]"><p className="font-dm-sans text-xs uppercase tracking-wider text-[#c9a227]">{date}</p><div><h4 className="font-dm-sans text-sm text-[#f4f1e1]">{company} · <span className="text-[#a3b3a6]">{role}</span></h4><p className="mt-1 font-dm-sans text-xs leading-relaxed text-[#a3b3a6]">{detail}</p></div></div>)}</div></section>

            <section><p className="font-dm-sans text-xs uppercase tracking-[.25em] text-[#c9a227]">Formación</p><h3 className="mt-2 font-cinzel text-2xl text-[#f4f1e1]">Educación y certificaciones</h3><div className="mt-5 grid gap-3 sm:grid-cols-2">{EDUCATION.map(([status, program, institution]) => <div key={program} className="rounded-lg border border-white/5 bg-black/20 p-4"><span className="font-dm-sans text-[10px] uppercase tracking-widest text-[#c9a227]">{status}</span><h4 className="mt-2 font-dm-sans text-sm text-[#f4f1e1]">{program}</h4><p className="mt-1 font-dm-sans text-xs text-[#a3b3a6]">{institution}</p></div>)}</div></section>

            <section className="flex flex-col gap-4 rounded-xl border border-[#c9a227]/20 bg-[#020b04]/50 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-cinzel text-xl text-[#f4f1e1]">Código abierto y proyectos</p><p className="mt-1 font-dm-sans text-sm text-[#a3b3a6]">Encriptador de Texto, AluraGeek, AluraFlix y proyectos de desarrollo web, sistemas y telecomunicaciones.</p><p className="mt-2 font-dm-sans text-xs text-[#c9a227]/80">Alura ONE · Oracle Next Education · 327 horas de formación completadas.</p></div><a href="https://github.com/xrokirambox" target="_blank" rel="noreferrer" className="btn-gold inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2.5 font-dm-sans text-xs uppercase tracking-widest"><Github className="w-4 h-4" /> Ver GitHub <ExternalLink className="w-3.5 h-3.5" /></a></section>
          </div>
        </div>
      </article>
    </div>, document.body
  );
};
