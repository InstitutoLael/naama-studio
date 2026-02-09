import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, Stars, X, ZoomIn, MessageCircle } from 'lucide-react';

const START_DATE = new Date('2023-12-10T13:00:00');

// --- DATA: "LOS HILOS DEL DESTINO" (Top 5) ---
const STORY_HIGHLIGHTS = [
  { 
    id: 1, 
    src: "/assets/romantic/FotoprofesionalBesito.jpeg", 
    text: "El Sello de nuestro pacto", 
    date: "Amor",
    rotate: -2 
  },
  { 
    id: 2, 
    src: "/assets/romantic/Primerasfotosjuntos.jpeg", 
    text: "Donde todo comenzó", 
    date: "Inicio",
    rotate: 3 
  },
  { 
    id: 3, 
    src: "/assets/romantic/Fotodespuesdevigilia.jpeg", 
    text: "Nuestra Fe nos sostiene", 
    date: "Fe",
    rotate: -4 
  },
  { 
    id: 4, 
    src: "/assets/romantic/Diadepicnic.jpeg", 
    text: "Paz en medio del caos", 
    date: "Paz",
    rotate: 2 
  },
  { 
    id: 5, 
    src: "/assets/romantic/Fotoqueamodeella.jpeg", 
    text: "Simplemente tú", 
    date: "Tú",
    rotate: 5 
  },
];

// --- DATA: "NUESTRO UNIVERSO" (Resto) ---
const GALLERY_MEMORIES = [
  { id: 6, src: "/assets/romantic/Foto1Noviembre.jpeg" },
  { id: 7, src: "/assets/romantic/FotoBabyShowerdeamigos.jpeg" },
  { id: 8, src: "/assets/romantic/FotoBonitosParafondo.jpeg" },
  { id: 9, src: "/assets/romantic/Fotodeellaenelestadio.jpeg" },
  { id: 10, src: "/assets/romantic/Fotodestarwars.jpeg" },
  { id: 11, src: "/assets/romantic/Fotoenelcerro.jpeg" },
  { id: 12, src: "/assets/romantic/Fotoenelespejo.jpeg" },
  { id: 13, src: "/assets/romantic/Fotoenelestadio.jpeg" },
  { id: 14, src: "/assets/romantic/FotoFormal.jpeg" },
  { id: 15, src: "/assets/romantic/Fotolindos.jpeg" },
  { id: 16, src: "/assets/romantic/Fotoregaloneando.jpeg" },
  { id: 17, src: "/assets/romantic/FotosdeColoColo.jpeg" },
  { id: 18, src: "/assets/romantic/FotoSELL.jpeg" },
  { id: 19, src: "/assets/romantic/FotosEnplayita.jpeg" },
  { id: 20, src: "/assets/romantic/MiCumpleaños.jpeg" }
];

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
      <div className="bg-white p-3 pb-14 shadow-2xl transform transition-transform duration-300 hover:scale-[1.02] relative">
        <div className="aspect-[4/5] w-full overflow-hidden bg-gray-100 relative mb-3">
            <div className="absolute inset-0 bg-amber-900/10 mix-blend-multiply z-10 pointer-events-none"></div>
            <img src={data.src} alt={data.text} className="w-full h-full object-cover pointer-events-none select-none" />
        </div>
        
        <div className="absolute bottom-3 left-0 right-0 px-4 text-center">
            <p className="font-dancing text-2xl text-slate-800 leading-tight">{data.text}</p>
            <span className="block mt-1 text-[10px] font-sans text-slate-400 uppercase tracking-widest">{data.date}</span>
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
  const [selectedImage, setSelectedImage] = useState(null);
  const audioRef = useRef(null); // Persistent Audio Ref

  // Privacy
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => document.head.removeChild(meta);
  }, []);

  // Timer
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = now - START_DATE;
      setElapsed({
        yrs: Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)),
        mos: Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44)),
        dias: Math.floor((diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24)),
        hrs: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        min: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seg: Math.floor((diff % (1000 * 60)) / 1000),
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
    // Try to play audio
    if (audioRef.current) {
        audioRef.current.volume = 0.4;
        audioRef.current.play().catch(e => console.log("Audio autoplay prevented", e));
    }
  };

  const removeCard = (id) => {
      setCards(prev => {
          const newCards = prev.filter(c => c.id !== id);
          if (newCards.length === 0) {
              setTimeout(() => setCards(STORY_HIGHLIGHTS), 1500); // Reload deck
          }
          return newCards;
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden relative selection:bg-rose-500/30">

        {/* --- PERSISTENT AUDIO --- 
            Placed here at root level so it doesn't unmount when switching phases. 
            Using a romantic piano track as placeholder. 
        */}
        <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3" loop preload="auto" />

        {/* --- BACKGROUND --- */}
        <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
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
                    <h1 className="font-playfair text-4xl md:text-6xl mb-8 leading-tight text-white drop-shadow-lg">
                        Cami... <br/>
                        <span className="text-2xl md:text-3xl font-light text-slate-400 block mt-6 font-dancing">
                            ¿Seguimos escribiendo esta historia?
                        </span>
                    </h1>

                    <div className="flex flex-col md:flex-row gap-6 items-center mt-8 w-full justify-center min-h-[100px]">
                         <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleYes}
                            className="px-12 py-4 bg-gradient-to-r from-rose-500 to-amber-600 rounded-full text-white font-playfair tracking-widest text-xl shadow-lg z-10"
                        >
                            SÍ
                        </motion.button>

                        <motion.button
                            onMouseEnter={moveNoButton}
                            onTouchStart={moveNoButton}
                            animate={{ x: noBtnPos.x, y: noBtnPos.y }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="px-8 py-4 text-slate-500 font-sans text-sm tracking-widest border border-slate-800 rounded-full"
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
                    <div className="text-center mb-12">
                        <Heart className="w-8 h-8 text-rose-500 mx-auto mb-4" fill="#f43f5e" />
                        <h2 className="font-playfair text-3xl text-white">Nuestra Historia</h2>
                        <div className="font-mono text-amber-100 mt-4 text-lg">
                            {elapsed.yrs} Años • {elapsed.mos} Meses • {elapsed.dias} Días
                        </div>
                    </div>

                    {/* SECTION 1: INTERACTIVE DECK (Los Hilos del Destino) */}
                    <section className="relative w-full flex flex-col items-center justify-center min-h-[550px] mb-24">
                        <h3 className="font-dancing text-2xl text-slate-400 mb-8">Los Hilos del Destino</h3>
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
                        <p className="mt-8 text-slate-500 text-xs animate-bounce">← Desliza →</p>
                    </section>

                    {/* SECTION 2: NUESTRO UNIVERSO (Infinite Masonry) */}
                    <section className="w-full pt-12 border-t border-slate-800/50">
                        <div className="text-center mb-16">
                            <h3 className="font-playfair text-3xl md:text-5xl text-white mb-4">Nuestro Universo</h3>
                            <p className="text-slate-400 font-dancing text-xl">Cada foto, un tesoro.</p>
                        </div>
                        
                        {/* Modified Grid: 2 columns on mobile (columns-2) */}
                        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 px-2">
                            {GALLERY_MEMORIES.map((photo, i) => (
                                <motion.div
                                    key={photo.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.6, delay: i % 4 * 0.1 }}
                                    className="break-inside-avoid relative group rounded-lg overflow-hidden cursor-zoom-in shadow-xl"
                                    onClick={() => setSelectedImage(photo.src)}
                                >
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 z-10">
                                        <ZoomIn className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
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

                    {/* FINAL CTA & WHATSAPP BUTTON */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="mt-32 mb-24 text-center max-w-lg mx-auto px-6"
                    >
                        <p className="font-playfair text-2xl md:text-3xl text-white mb-4 leading-relaxed">
                            ¿Viste todo lo que hemos construido?<br/>
                            <span className="text-rose-400 italic">Aún quedan muchas fotos por sacar.</span>
                        </p>
                        <p className="font-dancing text-4xl text-amber-100 mt-8 mb-12">Te espero.</p>

                        <a 
                            href="https://wa.me/56949481562?text=Vi%20la%20página...%20hablemos."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-full font-playfair tracking-normal text-lg transition-all shadow-lg hover:shadow-emerald-500/30 group"
                        >
                            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Escribir el siguiente capítulo...
                        </a>
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
                    <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                        <X size={32} />
                    </button>
                    <motion.img 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        src={selectedImage} 
                        className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-2xl"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default NuestraHistoria;
