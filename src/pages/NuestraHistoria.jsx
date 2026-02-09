import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, Stars, X, ZoomIn, MessageCircle, Plus, Camera, Music, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import ReactPlayer from 'react-player';

const START_DATE = new Date('2023-12-10T13:00:00');

// --- DATA: "LOS HILOS DEL DESTINO" (Top 6) ---
const STORY_HIGHLIGHTS = [
  { 
    id: 1, 
    src: "/assets/romantic/FotoprofesionalBesito.jpeg", 
    text: "El Sello: Tú y yo contra el mundo.", 
    rotate: -2 
  },
  { 
    id: 2, 
    src: "/assets/romantic/PrimerMensajedeWhatsApp.jpeg", 
    text: "Ese primer mensaje... Bendita la hora en que me atreví a escribirte.", 
    rotate: 3,
    isScreenshot: true 
  },
  { 
    id: 3, 
    src: "/assets/romantic/Cartafondoblanco.jpeg", 
    text: "Tus palabras, tu letra. Guardo esto como mi mayor tesoro.", 
    rotate: -3 
  },
  { 
    id: 4, 
    src: "/assets/romantic/Fotodespuesdevigilia.jpeg", 
    text: "'Tú sana, que yo pongo la fe en marcha'. Trato hecho.", 
    rotate: 2 
  },
  { 
    id: 5, 
    src: "/assets/romantic/Primerasfotosjuntos.jpeg", 
    text: "La inocencia del principio. Si supieran lo que venía...", 
    rotate: -4 
  },
  { 
    id: 6, 
    src: "/assets/romantic/Fotoqueamodeella.jpeg", 
    text: "Simplemente tú. Mi vista favorita.", 
    rotate: 4 
  },
];

// --- DATA: "NUESTRO UNIVERSO" (Resto) ---
const GALLERY_MEMORIES = [
  { id: 7, src: "/assets/romantic/cartanegra.jpg", text: "Aún leo lo que escribimos aquí..." },  
  { id: 8, src: "/assets/romantic/Diadepicnic.jpeg" },
  { id: 9, src: "/assets/romantic/FotosdeColoColo.jpeg" },
  { id: 10, src: "/assets/romantic/Foto1Noviembre.jpeg" },
  { id: 11, src: "/assets/romantic/FotoBabyShowerdeamigos.jpeg" },
  { id: 12, src: "/assets/romantic/FotoBonitosParafondo.jpeg" },
  { id: 13, src: "/assets/romantic/Fotodeellaenelestadio.jpeg" },
  { id: 14, src: "/assets/romantic/Fotodestarwars.jpeg" },
  { id: 15, src: "/assets/romantic/Fotoenelcerro.jpeg" },
  { id: 16, src: "/assets/romantic/Fotoenelespejo.jpeg" },
  { id: 17, src: "/assets/romantic/Fotoenelestadio.jpeg" },
  { id: 18, src: "/assets/romantic/FotoFormal.jpeg" },
  { id: 19, src: "/assets/romantic/Fotolindos.jpeg" },
  { id: 20, src: "/assets/romantic/Fotoregaloneando.jpeg" },
  { id: 21, src: "/assets/romantic/FotoSELL.jpeg" },
  { id: 22, src: "/assets/romantic/FotosEnplayita.jpeg" },
  { id: 23, src: "/assets/romantic/MiCumpleaños.jpeg" }
];

// --- COMPONENT: TIMING COUNTER (The "Deep Time" Design) ---
const TimeCounter = ({ elapsed, total }) => {
    return (
        <div className="w-full max-w-5xl mx-auto mt-12 mb-20 relative px-4">
            
            {/* 1. THE MAIN BREAKDOWN (YY/MM/DD) */}
            <div className="grid grid-cols-3 gap-2 md:gap-8 mb-4 md:mb-8">
                <TimeBox value={elapsed.yrs} label="Años" color="text-rose-200" />
                <TimeBox value={elapsed.mos} label="Meses" color="text-rose-200" />
                <TimeBox value={elapsed.dias} label="Días" color="text-rose-200" />
            </div>

            {/* 2. THE DETAILS (HH/MM/SS) */}
            <div className="grid grid-cols-3 gap-2 md:gap-8 mb-12">
                 <TimeBox value={elapsed.hrs} label="Horas" color="text-amber-100" size="small" />
                 <TimeBox value={elapsed.min} label="Minutos" color="text-amber-100" size="small" />
                 <TimeBox value={elapsed.seg} label="Segundos" color="text-amber-200" size="small" highlight />
            </div>

            {/* 3. THE PERSPECTIVE (Cumulative Totals) */}
            <div className="relative pt-10 border-t border-white/10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0f172a] px-4 text-xs text-white/40 uppercase tracking-[0.3em]">
                    Lo que eso significa
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <CumulativeBox value={total.days} label="Días Totales" />
                    <CumulativeBox value={total.hours} label="Horas de Historia" />
                    <CumulativeBox value={total.seconds} label="Segundos juntos" />
                </div>
            </div>
        </div>
    );
};

const TimeBox = ({ value, label, color, size = "large", highlight = false }) => (
    <div className={`flex flex-col items-center justify-center bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl ${size === "large" ? 'p-2 md:p-8' : 'p-2 md:p-6'} ${highlight ? 'ring-1 ring-amber-400/30 bg-amber-900/10' : ''}`}>
        <span className={`font-playfair font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 ${size === "large" ? 'text-3xl md:text-7xl' : 'text-2xl md:text-5xl'} ${color} drop-shadow-sm`}>
            {String(value || 0).padStart(2, '0')}
        </span>
        <span className="text-[9px] md:text-xs tracking-[0.3em] text-white/40 uppercase mt-2 md:mt-4">{label}</span>
    </div>
);

const CumulativeBox = ({ value, label }) => (
    <div className="flex flex-col animate-pulse-slow">
        <span className="font-mono text-lg md:text-2xl text-white/80">
            {new Intl.NumberFormat('es-CL').format(value || 0)}
        </span>
        <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/30 mt-1">{label}</span>
    </div>
);

// --- COMPONENT: CARD/POLAROID (DECK) ---
const PolaroidCard = ({ data, index, total, onRemove }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    if (Math.abs(info.offset.x) > 100) {
      onRemove(data.id);
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      style={{ 
        x, 
        rotate: rotate, 
        opacity,
        zIndex: isDragging ? 100 : total - index, 
        rotateZ: data.rotate
      }}
      animate={{ 
          scale: index === 0 ? 1 : 0.95 - index * 0.05, 
          y: index * 10,
      }}
      className="absolute top-0 w-full max-w-[300px] md:max-w-sm cursor-grab active:cursor-grabbing"
    >
      <div className="bg-white p-3 pb-20 shadow-2xl transform transition-transform duration-300 hover:scale-[1.02] relative">
        <div className="aspect-[4/5] w-full overflow-hidden bg-gray-100 relative mb-3">
            <div className="absolute inset-0 bg-amber-900/10 mix-blend-multiply z-10 pointer-events-none"></div>
            <img 
                src={data.src} 
                alt="Recuerdo" 
                className={`w-full h-full pointer-events-none select-none ${
                    data.isScreenshot ? 'object-contain bg-gray-100 p-2' : 'object-cover'
                }`} 
            />
        </div>
        
        <div className="absolute bottom-4 left-0 right-0 px-4 text-center">
            <p className="font-dancing text-xl text-gray-900 leading-tight drop-shadow-sm font-semibold">{data.text}</p>
        </div>
      </div>
    </motion.div>
  );
};


// --- MAIN COMPONENT ---
const NuestraHistoria = () => {
  const [started, setStarted] = useState(false);
  const [noBtnText, setNoBtnText] = useState("Mejor lo borro");
  const [noBtnPos, setNoBtnPos] = useState({ x: 0, y: 0 });
  const [cards, setCards] = useState(STORY_HIGHLIGHTS);
  const [elapsed, setElapsed] = useState({});
  const [totalStats, setTotalStats] = useState({}); 
  const [showLetter, setShowLetter] = useState(false); 
  const [selectedImage, setSelectedImage] = useState(null); // Restored Lightbox State

  // ... (meta tags effect)

  // Timer
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = now - START_DATE;
      
      // Breakdown
      setElapsed({
        yrs: Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)),
        mos: Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44)),
        dias: Math.floor((diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24)),
        hrs: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        min: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seg: Math.floor((diff % (1000 * 60)) / 1000),
      });

      // Cumulative Totals
      setTotalStats({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor(diff / (1000 * 60 * 60)),
          seconds: Math.floor(diff / 1000)
      });

    }, 1000);
    return () => clearInterval(interval);
  }, [started]);

  // "No" Button Logic
  const moveNoButton = () => {
    const x = Math.random() * (Math.min(window.innerWidth - 200, 300)) * (Math.random() > 0.5 ? 1 : -1);
    const y = Math.random() * (Math.min(window.innerHeight - 100, 300)) * (Math.random() > 0.5 ? 1 : -1);
    setNoBtnPos({ x, y });
    
    const phrases = ["¡Tramposa!", "¡Muy lenta!", "No te rindas", "El destino dice SÍ", "Ups..."];
    setNoBtnText(phrases[Math.floor(Math.random() * phrases.length)]);
  };

  const handleYes = () => {
    if (window.confetti) {
        window.confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF69B4', '#FFB6C1', '#FFC0CB']
        });
    }
    setStarted(true);
  };

  const removeCard = (id) => {
      setCards(prev => {
          const newCards = prev.filter(c => c.id !== id);
          if (newCards.length === 0) {
              setTimeout(() => setCards(STORY_HIGHLIGHTS), 1500); 
          }
          return newCards;
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden relative selection:bg-rose-500/30">

        {/* --- FLOATING MUSIC CARD (LINK ONLY) --- */}
        {started && (
             <div className="fixed bottom-6 right-6 z-50">
                <a 
                    href="https://youtu.be/USDX0X-d588?si=p7cMXFaTbm3ojJv9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 bg-black/60 backdrop-blur-md border border-rose-500/30 px-5 py-3 rounded-full shadow-2xl hover:bg-black/80 transition-all group"
                >
                    <div className="relative">
                        <Music size={20} className="text-rose-400 animate-spin-slow" />
                        <div className="absolute inset-0 bg-rose-500/20 blur-lg rounded-full animate-pulse"></div>
                    </div>
                    
                    <div className="flex flex-col mr-2">
                        <span className="text-[10px] uppercase tracking-widest text-white/50 group-hover:text-rose-300 transition-colors">Nuestra Canción</span>
                        <span className="text-sm font-semibold text-white underline decoration-white/30 underline-offset-4 group-hover:text-rose-100 transition-colors">
                            No Se Va - Morat
                        </span>
                    </div>
                </a>
            </div>
        )}

        {/* --- BACKGROUND --- */}
        <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            
            {/* Ambient Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-900/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow delay-1000"></div>

            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-white rounded-full blur-[1px] opacity-30"
                    initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
                    animate={{ y: [null, Math.random() * -50] }}
                    transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: "easeInOut", yoyo: Infinity }}
                    style={{ width: Math.random() * 3 + 1, height: Math.random() * 3 + 1 }}
                />
            ))}
        </div>

        <AnimatePresence mode="wait">
            {!started ? (
                // --- INTRO PHASE ---
                <motion.div 
                    key="intro"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                    transition={{ duration: 0.8 }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center"
                >
                    <Stars className="w-12 h-12 text-amber-200 mx-auto mb-6 opacity-80 animate-pulse" />
                    <h1 className="font-playfair text-4xl md:text-6xl mb-8 leading-tight text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                        Cami... <br/>
                        <span className="text-2xl md:text-3xl font-light text-slate-300 block mt-6 font-dancing drop-shadow-lg shadow-black">
                            ¿Seguimos escribiendo esta historia?
                        </span>
                    </h1>

                    <div className="flex flex-col md:flex-row gap-6 items-center mt-8 w-full justify-center min-h-[100px]">
                         <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleYes}
                            className="px-12 py-4 bg-gradient-to-r from-rose-500 to-amber-600 rounded-full text-white font-playfair tracking-widest text-xl shadow-lg z-10 box-decoration-clone"
                        >
                            SÍ
                        </motion.button>

                        <motion.button
                            onMouseEnter={moveNoButton}
                            onTouchStart={moveNoButton}
                            animate={{ x: noBtnPos.x, y: noBtnPos.y }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="px-8 py-4 text-slate-400 font-sans text-sm tracking-widest border border-slate-700 bg-black/20 backdrop-blur-sm rounded-full"
                        >
                            {noBtnText}
                        </motion.button>
                    </div>
                </motion.div>
            ) : (
                // --- MAIN PHASE ---
                <motion.div 
                    key="main"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 0.5, duration: 1.5 }}
                    className="relative z-10 min-h-screen flex flex-col items-center py-16 px-4 w-full max-w-7xl mx-auto"
                >
                    {/* Header */}
                    <div className="text-center mb-16 px-4">
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        >
                             <Heart className="w-10 h-10 text-rose-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]" fill="#f43f5e" />
                        </motion.div>
                        <h2 className="font-playfair text-4xl md:text-5xl text-white drop-shadow-lg shadow-black tracking-wide">Nuestra Historia</h2>
                        <TimeCounter elapsed={elapsed} total={totalStats} />
                    </div>

                    {/* SECTION 1: INTERACTIVE DECK (Los Hilos del Destino) */}
                    <section className="relative w-full flex flex-col items-center justify-center min-h-[550px] mb-24">
                        <h3 className="font-dancing text-3xl text-slate-300 mb-12 drop-shadow-lg shadow-black">Los Hilos del Destino</h3>
                        <div className="relative w-full max-w-[300px] md:max-w-sm h-[450px] flex items-center justify-center perspective-1000">
                             {cards.map((card, index) => (
                                 <PolaroidCard 
                                    key={card.id} 
                                    data={card} 
                                    index={index} 
                                    total={cards.length} 
                                    onRemove={removeCard} 
                                 />
                             ))}
                        </div>
                        <p className="mt-8 text-slate-400 text-xs animate-bounce drop-shadow-md tracking-widest uppercase">← Desliza →</p>
                    </section>

                    {/* SECTION 2: NUESTRO UNIVERSO (Infinite Masonry) */}
                    <section className="w-full pt-16 border-t border-white/5 bg-gradient-to-b from-transparent to-black/30">
                        <div className="text-center mb-16">
                            <h3 className="font-playfair text-3xl md:text-5xl text-white mb-4 drop-shadow-lg shadow-black">Nuestro Universo</h3>
                            <p className="text-slate-300 font-dancing text-2xl drop-shadow-lg shadow-black">Cada recuerdo es eterno.</p>
                        </div>
                        
                        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 px-4 max-w-7xl mx-auto">
                            {GALLERY_MEMORIES.map((photo, i) => (
                                <motion.div
                                    key={photo.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.6, delay: i % 4 * 0.1 }}
                                    className="break-inside-avoid relative group rounded-lg overflow-hidden cursor-zoom-in shadow-xl ring-1 ring-white/10"
                                    onClick={() => setSelectedImage(photo)} 
                                >
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 z-10">
                                        <ZoomIn className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                    </div>
                                    <img 
                                        src={photo.src} 
                                        alt="Recuerdo" 
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                        loading="lazy"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* SECTION 3: THE DEDICATION & EMPTY FRAMES (Future) */}
                    <section className="mt-32 max-w-5xl mx-auto px-4">
                         
                        {/* Dedication Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-[#fffdf5] p-8 md:p-12 shadow-2xl rotate-1 max-w-lg mx-auto mb-20 relative transform hover:rotate-0 transition-transform duration-500"
                        >
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/20 backdrop-blur-sm border-l border-r border-white/50 -rotate-1 shadow-sm"></div>
                            <h4 className="font-dancing text-3xl text-gray-800 mb-6 font-bold text-center border-b border-gray-200 pb-4">10 de Diciembre</h4>
                            <p className="font-dancing text-xl text-gray-800 leading-relaxed text-center">
                                "Sé que técnicamente no estamos contando... pero mi corazón no sabe de pausas. Feliz día, Cami."
                            </p>
                            
                            <div className="mt-8 text-center">
                                <button 
                                    onClick={() => setShowLetter(true)}
                                    className="text-xs font-serif italic text-rose-500 hover:text-rose-700 border-b border-rose-300 pb-0.5 transition-colors"
                                >
                                    Leer algo más...
                                </button>
                            </div>
                        </motion.div>

                        {/* Empty Frames */}
                        <div className="text-center mb-12">
                            <h3 className="font-playfair text-3xl text-white/90 italic mb-12 drop-shadow-lg shadow-black">Lo que está por venir...</h3>
                            
                            <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
                                {/* Frame 1 */}
                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="w-64 h-80 border-[1px] border-dashed border-white/30 rounded-lg flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm p-6 text-center group transition-all hover:border-rose-400/50 hover:bg-white/10 shadow-lg relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-6 text-white/40 group-hover:text-rose-200 group-hover:bg-white/10 transition-all border border-white/10">
                                            <Camera size={28} />
                                        </div>
                                        <p className="font-playfair text-white/90 text-lg drop-shadow-md">Próximo 10 de Diciembre</p>
                                        <span className="text-[10px] text-rose-300 uppercase tracking-widest mt-3 drop-shadow-md border-t border-white/10 pt-2 px-4">Aniversario Oficial</span>
                                    </div>
                                </motion.div>

                                {/* Frame 2 */}
                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="w-64 h-80 border-[1px] border-dashed border-white/30 rounded-lg flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm p-6 text-center group transition-all hover:border-amber-400/50 hover:bg-white/10 shadow-lg relative overflow-hidden"
                                >
                                     <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                     <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-6 text-white/40 group-hover:text-amber-200 group-hover:bg-white/10 transition-all border border-white/10">
                                            <Plus size={28} />
                                        </div>
                                        <p className="font-playfair text-white/90 text-lg drop-shadow-md">Próxima Aventura</p>
                                        <span className="text-[10px] text-amber-200 uppercase tracking-widest mt-3 drop-shadow-md border-t border-white/10 pt-2 px-4">Destino: Desconocido</span>
                                     </div>
                                </motion.div>
                            </div>
                        </div>
                    </section>

                    {/* FINAL CTA & WHATSAPP BUTTON */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="mt-32 mb-24 text-center max-w-2xl mx-auto px-6"
                    >
                         <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-10"></div>
                        <p className="font-playfair text-3xl md:text-4xl text-white mb-6 leading-relaxed drop-shadow-lg shadow-black">
                            <span className="block text-2xl mb-4 text-white/70 italic">¿Viste todo lo que hemos construido?</span>
                            "Aún quedan muchas páginas en blanco...<br/>pero esas se escriben de a dos."
                        </p>
                        <p className="font-sans text-sm tracking-[0.2em] text-amber-100/60 uppercase mb-12">Sin prisa, pero con ganas.</p>

                        <a 
                            href="https://wa.me/56949481562?text=Escribamos%20el%20siguiente%20capítulo..."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-emerald-800 to-emerald-600 hover:from-emerald-700 hover:to-emerald-500 text-white rounded-full font-playfair tracking-wide text-lg transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] group transform hover:-translate-y-1"
                        >
                            <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                            Escribir el siguiente capítulo...
                        </a>

                        {/* Easter Egg / The Faith Quote */}
                        <div className="mt-20 opacity-40 hover:opacity-100 transition-opacity duration-1000 max-w-lg mx-auto">
                             <Heart size={14} className="mx-auto mb-4 text-rose-500 animate-pulse" />
                             <p className="text-xs md:text-sm text-slate-400 italic font-serif tracking-widest leading-loose">
                                "Lo mío es fe."
                            </p>
                        </div>
                       
                    </motion.div>

                </motion.div>
            )}
        </AnimatePresence>

        {/* LETTER MODAL */}
        <AnimatePresence>
            {showLetter && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setShowLetter(false)}
                >
                    <motion.div 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-[#fffdf5] w-full max-w-lg p-8 md:p-12 rounded-sm shadow-2xl relative max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setShowLetter(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-8">
                            <Heart size={20} className="text-rose-500 mx-auto mb-4" />
                            <h3 className="font-playfair text-2xl text-gray-900 border-b border-gray-200 pb-4 mx-10">Desde el Corazón</h3>
                        </div>

                        <div className="font-dancing text-xl text-gray-800 space-y-6 leading-relaxed text-justify">
                            <p>
                                Sé que es una lucha muy grande cuando la cabeza dice una cosa y el corazón siente otra…
                            </p>
                            <p>
                                Respeto tu decisión y tu espacio. Pero por mi parte, ya no me muevo por mis propias fuerzas... porque si fuera solo por mí, quizás ya me habría rendido hace rato.
                            </p>
                            <p className="font-bold text-rose-900">
                                Lo mío es fe, y esa no siempre entiende de lógica humana.
                            </p>
                            <p>
                                No pretendo incomodarte, solo quería que supieras que aquí sigo, construyendo, esperando y creyendo.
                            </p>
                        </div>

                        <div className="mt-12 text-right">
                            <p className="font-playfair italic text-gray-600">Diego.</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* LIGHTBOX */}
        <AnimatePresence>
            {selectedImage && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110]">
                        <X size={32} />
                    </button>
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()} // Prevent close on image click
                    >
                         <img 
                            src={selectedImage.src} 
                            className="max-w-full max-h-[85vh] object-contain rounded-sm shadow-2xl"
                        />
                        {/* Display caption if it exists */}
                        {selectedImage.text && (
                             <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                delay={0.2}
                                className="mt-6 px-6 py-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10"
                             >
                                <p className="text-white font-dancing text-xl md:text-2xl drop-shadow-md text-center">
                                    {selectedImage.text}
                                </p>
                             </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default NuestraHistoria;
