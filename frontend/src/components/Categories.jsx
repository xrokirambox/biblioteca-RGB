import React from "react";
import {
  ArrowUpRight, Users, BookOpen, BookOpenText, GraduationCap, Sprout,
  Library, School, Folder, FileText, Link2, Sigma, Leaf, Globe2, Languages,
  Palette, Dumbbell, HeartHandshake, FlaskConical, Atom, TestTube2, ScrollText,
  Cpu, FunctionSquare, Brain, LineChart, Layers, Network, Award, Star,
  Bookmark, BookMarked, BookX, BookCheck, PenTool, Ruler, Calculator, Compass,
  Music, Monitor, Code, Database, Grid, Layout, List, CheckSquare, Clipboard,
  FileCode, Hash, Binary, Share2, Shield, Lock, Key, Unlock, Zap, Sun, Moon,
  Cloud, Wind, Droplets, Thermometer, Microscope, Telescope, Satellite, Rocket,
  Plane, Car, Train, Truck, Ship, Anchor, Flag, MapPin, Navigation, Globe, Earth,
  Home, Building, Building2, Warehouse, Landmark, TreePine, Flower, Mountain,
  Waves, Umbrella, Snowflake, Flame, FireExtinguisher, Siren, AlertTriangle,
  AlertCircle, Info, HelpCircle, CheckCircle, XCircle, MinusCircle,
  PlusCircle, PlayCircle, PauseCircle, StopCircle, SkipForward, SkipBack, Rewind,
  FastForward, Repeat, Shuffle, Volume, Volume1, Volume2, VolumeX, Mic, MicOff,
  Headphones, Speaker, Watch, Clock, AlarmClock, Timer, Hourglass, Calendar,
  CalendarCheck, CalendarX, CalendarPlus, CalendarMinus, CalendarClock, Pin, PinOff,
  MapPinned, Locate, Crosshair, Target, Radar, Scan, ScanLine, ScanFace, ScanEye,
  ScanSearch, Fingerprint, ScanText, Barcode, QrCode, Ticket, TicketCheck, User,
  UserCheck, UserPlus, Mail, Phone, MessageCircle, MessageSquare, Bell, Search,
  Filter, BarChart, PieChart, TrendingUp, Activity, Heart, ThumbsUp,
  Eye, Printer, Download, Upload, Paperclip, Tag, Tags, Circle, Square, Triangle,
  Hexagon, Octagon, Diamond, Crown, Trophy, Medal, Gift, ShoppingCart, Wallet,
  CreditCard, Receipt, Package, Box, Archive, Trash, RefreshCw, RotateCcw, Undo,
  Redo, Scissors, Copy, ClipboardList, ClipboardCheck, FilePlus, FileMinus, FileEdit,
  ExternalLink, LogIn, LogOut, Settings, Sliders, ToggleLeft, ToggleRight, Wifi,
  Bluetooth, Cast, Airplay, Radio, Tv, MonitorPlay, Film, Video, Camera, Image,
  Images, Aperture, Focus, ZoomIn, ZoomOut, Maximize, Minimize, Move, Bold, Italic, Underline, Strikethrough,
  Heading, Type, Quote, Terminal, Bug, GitBranch, GitCommit, GitMerge,
  GitPullRequest, Github, Gitlab, Monitor as Chrome, Castle, Church, Hospital, Hotel, Store,
  DivideCircle,
} from "lucide-react";
import { Map as MapIcon } from "lucide-react";
import { useLibrary } from "../context/LibraryContext";

const ICONS = {
  BookOpen, BookOpenText, GraduationCap, Sprout, Users,
  ArrowUpRight, Library, School, Folder, FileText, Link2,
  Sigma, Leaf, Globe2, Languages, Palette, Dumbbell, HeartHandshake,
  FlaskConical, Atom, TestTube2, ScrollText, MapIcon, Cpu, FunctionSquare,
  Brain, LineChart, Layers, Network, Award, Star, Bookmark,
  BookMarked, BookX, BookCheck, PenTool, Ruler, Calculator,
  Compass, Music, Monitor, Code, Database, Grid,
  Layout, List, CheckSquare, Clipboard, FileCode, Hash, Binary,
  Share2, Shield, Lock, Key, Unlock, Zap, Sun, Moon, Cloud,
  Wind, Droplets, Thermometer, Microscope, Telescope, Satellite,
  Rocket, Plane, Car, Train, Truck, Ship, Anchor, Flag, MapPin,
  Navigation, Globe, Earth, Home, Building, Building2, Warehouse,
  Landmark, TreePine, Flower, Mountain,
  Waves, Umbrella, Snowflake, Flame,
  FireExtinguisher, Siren, AlertTriangle, AlertCircle, Info,
  HelpCircle, CheckCircle, XCircle, MinusCircle, PlusCircle,
  PlayCircle, PauseCircle, StopCircle, SkipForward, SkipBack, Rewind,
  FastForward, Repeat, Shuffle, Volume, Volume1, Volume2, VolumeX,
  Mic, MicOff, Headphones, Speaker, Watch, Clock, AlarmClock, Timer,
  Hourglass, Calendar, CalendarCheck, CalendarX, CalendarPlus,
  CalendarMinus, CalendarClock, Pin, PinOff, MapPinned, Locate,
  Crosshair, Target, Radar, Scan, ScanLine, ScanFace, ScanEye,
  ScanSearch, ScanText, Barcode, QrCode, Ticket,
  TicketCheck, User, UserCheck, UserPlus, Mail, Phone, MessageCircle,
  MessageSquare, Bell, Search, Filter, BarChart, PieChart,
  TrendingUp, Activity, Heart, ThumbsUp, Eye, Printer, Download,
  Upload, Paperclip, Tag, Tags, Circle, Square, Triangle, Hexagon,
  Octagon, Diamond, Crown, Trophy, Medal, Gift, ShoppingCart, Wallet,
  CreditCard, Receipt, Package, Box, Archive, Trash, RefreshCw,
  RotateCcw, Undo, Redo, Scissors, Copy, ClipboardList, ClipboardCheck,
  FilePlus, FileMinus, FileEdit, ExternalLink, LogIn, LogOut, Settings,
  Sliders, ToggleLeft, ToggleRight, Wifi, Bluetooth, Cast, Airplay,
  Radio, Tv, MonitorPlay, Film, Video, Camera, Image, Images, Aperture,
  Focus, ZoomIn, ZoomOut, Maximize, Minimize, Move, Bold, Italic, Underline,
  Strikethrough, Heading, Type, Quote, Terminal, Bug, GitBranch,
  GitCommit, GitMerge, GitPullRequest, Github, Gitlab, Chrome,
  Castle, Church, Hospital, Hotel, Store, DivideCircle,
};

function getIcon(name) {
  return ICONS[name] || BookOpen;
}

export const Categories = () => {
  const { openModal, goToHierCat, hierarchyTree, categories } = useLibrary();

  const handleClick = (catId) => {
    openModal();
    setTimeout(() => goToHierCat(catId), 10);
  };

  const safeHierarchyTree = Array.isArray(hierarchyTree) ? hierarchyTree.filter(Boolean) : [];
  const visibleCategories = (categories || []).filter((c) => c.status === "show");

  return (
    <section id="salones" data-testid="categories-section" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="mb-14 max-w-2xl">
          <div className="font-dm-sans text-xs tracking-[0.3em] uppercase text-[#c9a227]/80 mb-3">
            Salones de Clase
          </div>
          <h2 className="font-cinzel text-4xl sm:text-5xl text-[#f4f1e1] leading-tight">
            Selecciona un <span className="text-[#c9a227] italic font-cormorant">nivel académico</span>
          </h2>
          <div className="divider-gold mt-8" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {safeHierarchyTree.map((category, idx) => {
            const Icon = getIcon(category.icon);
            return (
              <button
                key={category.id}
                onClick={() => handleClick(category.id)}
                data-testid={`nivel-card-${category.id}`}
                className="group text-left glass rounded-lg p-8 relative overflow-hidden hover:border-[#c9a227]/50 transition-all duration-300 hover:-translate-y-1 animate-fade-up"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#c9a227]/10 rounded-bl-full group-hover:bg-[#c9a227]/20 transition-colors" />
                <div className="absolute top-5 right-5 text-[#c9a227]/70 group-hover:text-[#c9a227] transition-colors">
                  <ArrowUpRight className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </div>
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-[#c9a227]/10 flex items-center justify-center border border-[#c9a227]/30 mb-6">
                    <Icon className="w-6 h-6 text-[#c9a227]" />
                  </div>
                  <h3 className="font-cinzel text-3xl text-[#f4f1e1] mb-2">{category.name}</h3>
                  <div className="font-dm-sans text-xs tracking-[0.25em] uppercase text-[#c9a227] mb-5">
                    {category.subcategories?.length || 0} grados disponibles
                  </div>
                  <p className="font-cormorant text-lg text-[#a3b3a6] leading-relaxed">
                    {category.description || "Explora los grados y materias disponibles."}
                  </p>
                  <div className="mt-8 flex items-center gap-2 text-[#c9a227]/80 font-dm-sans text-xs tracking-wider uppercase">
                    <span className="h-px w-8 bg-[#c9a227]/60" />
                    {category.subcategories?.length || 0} grados
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {safeHierarchyTree.length === 0 && (
          <div className="text-center py-16 font-cormorant text-xl text-[#a3b3a6]">
            No hay niveles configurados. El staff puede crear la jerarquía desde el panel de administración.
          </div>
        )}

        {visibleCategories.length > 0 && (
          <div className="mt-16">
            <div className="font-dm-sans text-xs tracking-[0.3em] uppercase text-[#c9a227]/80 mb-6">
              Categorías especiales
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {visibleCategories.map((category, idx) => (
                <button
                  key={category.id}
                  onClick={() => handleClick(category.id)}
                  data-testid={`category-card-${category.id}`}
                  className="group text-left glass rounded-lg p-8 relative overflow-hidden hover:border-[#c9a227]/50 transition-all duration-300 hover:-translate-y-1 animate-fade-up"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#c9a227]/10 rounded-bl-full group-hover:bg-[#c9a227]/20 transition-colors" />
                  <div className="absolute top-5 right-5 text-[#c9a227]/70 group-hover:text-[#c9a227] transition-colors">
                    <ArrowUpRight className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </div>
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-[#c9a227]/10 flex items-center justify-center border border-[#c9a227]/30 mb-6">
                      <Users className="w-6 h-6 text-[#c9a227]" />
                    </div>
                    <h3 className="font-cinzel text-3xl text-[#f4f1e1] mb-2">{category.name}</h3>
                    <div className="font-dm-sans text-xs tracking-[0.25em] uppercase text-[#c9a227] mb-5">
                      {category.audience === "profesores" ? "Solo profesores"
                        : category.audience === "estudiantes" ? "Solo estudiantes"
                        : "General"}
                    </div>
                    <p className="font-cormorant text-lg text-[#a3b3a6] leading-relaxed min-h-[3rem]">
                      {category.description || "Categoría creada para ti "}
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-[#c9a227]/80 font-dm-sans text-xs tracking-wider uppercase">
                      <span className="h-px w-8 bg-[#c9a227]/60" />
                      Ver contenido
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};