import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, Stars } from 'lucide-react';

const START_DATE = new Date('2023-12-10T13:00:00');

// --- DATA: MEMORIAS PRINCIPALES (Deck Interactivo) ---
const MEMORIES = [
  {
    id: 1,
    img: "/assets/romantic/FotoprofesionalBesito.jpeg", 
    title: "Nuestro Amor",
    date: "El Sello",
    text: "No necesito nada más que este momento contigo. Tú y yo contra el mundo.",
    rotation: -3
  },
  {
    id: 2,
    img: "/assets/romantic/Primerasfotosjuntos.jpeg",
    title: "Donde todo empezó",
    date: "El Inicio",
    text: "Miro esta foto y pienso: 'Si supieran todo lo bonito que les espera a estos dos...'.",
    rotation: 4
  },
  {
    id: 3,
    img: "/assets/romantic/Fotodespuesdevigilia.jpeg",
    title: "Nuestra Fortaleza",
    date: "Fe Inquebrantable",
    text: "'Tú sana, que yo pongo la fe en marcha'. Trato hecho, mi amor. Dios está en medio.",
    rotation: -5
  },
  {
    id: 4,
    img: "/assets/romantic/FotosdeColoColo.jpeg",
    title: "La Pasión",
    date: "En el estadio",
    text: "Compartir pasiones contigo hace que todo sea el doble de emocionante. ¡Aguante nosotros!",
    rotation: 3
  },
  {
    id: 5,
    img: "/assets/romantic/Diadepicnic.jpeg",
    title: "Paz",
    date: "Tardes así...",
    text: "La vida se siente más liviana cuando estoy a tu lado. Gracias por tanta paz.",
    rotation: -2
  },
  {
    id: 6,
    img: "/assets/romantic/Fotoqueamodeella.jpeg",
    title: "Simplemente Tú",
    date: "Mi vista favorita",
    text: "Podría mirarte mil horas y no me cansaría. Eres arte, Cami.",
    rotation: 5
  }
];

// --- DATA: GALERÍA INFINITA (Resto de las fotos) ---
const GALLERY_PHOTOS = [
    "/assets/romantic/Foto1Noviembre.jpeg",
    "/assets/romantic/FotoBabyShowerdeamigos.jpeg",
    "/assets/romantic/FotoBonitosParafondo.jpeg",
    "/assets/romantic/FotoFormal.jpeg",
    "/assets/romantic/FotoSELL.jpeg",
    "/assets/romantic/Fotodeellaenelestadio.jpeg",
    "/assets/romantic/Fotodestarwars.jpeg",
    "/assets/romantic/Fotoenelcerro.jpeg",
    "/assets/romantic/Fotoenelespejo.jpeg",
    "/assets/romantic/Fotoenelestadio.jpeg",
    "/assets/romantic/Fotolindos.jpeg",
    "/assets/romantic/Fotoqueellasevepreciosa.jpeg",
    "/assets/romantic/Fotoregaloneando.jpeg",
    "/assets/romantic/FotosEnplayita.jpeg",
    "/assets/romantic/MiCumpleaños.jpeg"
];

// --- COMPONENT: CARD/POLAROID ---
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
        zIndex: isDragging ? 100 : total - index, // Ensure visual priority when dragging
        rotateZ: data.rotation
      }}
      animate={{ 
          scale: index === 0 ? 1 : 0.95 - index * 0.05, 
          y: index * 10,
      }}
      className="absolute top-0 w-full max-w-[320px] md:max-w-sm cursor-grab active:cursor-grabbing"
    >
      {/* Polaroid Structure */}
      <div className="bg-white p-4 pb-16 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transform transition-transform duration-300 hover:scale-[1.02] relative">
        {/* The Photo */}
        <div className="aspect-[4/5] w-full overflow-hidden bg-gray-100 relative mb-4">
            <div className="absolute inset-0 bg-amber-900/10 mix-blend-multiply z-10 pointer-events-none"></div> {/* Vintage Filter */}
            <img src={data.img} alt={data.title} className="w-full h-full object-cover pointer-events-none select-none" />
        </div>
        
        {/* The Text (Handwritten style in the white space) */}
        <div className="absolute bottom-4 left-0 right-0 px-6 text-center">
            <h3 className="font-dancing text-2xl text-slate-800 mb-1 font-bold">{data.title}</h3>
            <p className="font-dancing text-lg text-slate-600 leading-tight">{data.text}</p>
            <span className="block mt-2 text-[10px] font-sans text-slate-400 uppercase tracking-widest">{data.date}</span>
        </div>

        {/* Tape Effect */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-white/30 backdrop-blur-sm border-l border-r border-white/50 rotate-1 shadow-sm"></div>
      </div>
    </motion.div>
  );
};


// --- MAIN COMPONENT ---
const NuestraHistoria = () => {
  const [started, setStarted] = useState(false);
  const [noBtnText, setNoBtnText] = useState("Mejor lo borro");
  const [noBtnPos, setNoBtnPos] = useState({ x: 0, y: 0 });
  const [cards, setCards] = useState(MEMORIES);
  const [elapsed, setElapsed] = useState({});

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
    // Canvas Confetti
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
              setTimeout(() => setCards(MEMORIES), 1500); // Reload deck
          }
          return newCards;
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden relative selection:bg-rose-500/30">

        {/* --- BACKGROUND --- */}
        <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            {/* Soft Particles */}
            {[...Array(15)].map((_, i) => (
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
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Stars className="w-12 h-12 text-amber-200 mx-auto mb-6 opacity-80" />
                        <h1 className="font-playfair text-4xl md:text-7xl mb-8 leading-tight tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                            Cami... <br/>
                            <span className="text-2xl md:text-3xl font-light text-slate-400 block mt-6 font-dancing">
                                ¿Seguimos escribiendo esta historia?
                            </span>
                        </h1>
                    </motion.div>

                    <div className="flex flex-col md:flex-row gap-6 items-center mt-12 w-full justify-center relative min-h-[100px]">
                         <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleYes}
                            className="px-12 py-4 bg-gradient-to-r from-rose-500 to-amber-600 rounded-full text-white font-playfair tracking-widest text-xl shadow-[0_0_30px_rgba(244,63,94,0.4)] hover:shadow-[0_0_50px_rgba(244,63,94,0.6)] transition-all z-10"
                        >
                            SÍ, PARA SIEMPRE
                        </motion.button>

                        <motion.button
                            onMouseEnter={moveNoButton}
                            onTouchStart={moveNoButton}
                            animate={{ x: noBtnPos.x, y: noBtnPos.y }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="px-8 py-4 text-slate-500 font-sans text-sm tracking-widest hover:text-slate-300 transition-colors cursor-pointer border border-slate-800 rounded-full hover:border-slate-600"
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
                    className="relative z-10 min-h-screen flex flex-col items-center py-16 px-4 md:px-8 w-full max-w-7xl mx-auto"
                >
                    {/* Header / Counter */}
                    <header className="text-center mb-16 w-full">
                        <motion.div 
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 1 }}
                            className="mb-8"
                        >
                            <Heart className="w-8 h-8 text-rose-500 mx-auto mb-4 animate-pulse" fill="#f43f5e" />
                            <h2 className="font-playfair text-3xl md:text-5xl text-white mb-2">Nuestra Historia</h2>
                            <p className="font-dancing text-xl md:text-2xl text-slate-400">Cada segundo cuenta...</p>
                        </motion.div>
                        
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 md:p-8 inline-block border border-white/10 shadow-2xl">
                             <div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-10 font-mono text-amber-100">
                                 {[
                                     { l: 'Años', v: elapsed.yrs },
                                     { l: 'Meses', v: elapsed.mos },
                                     { l: 'Días', v: elapsed.dias },
                                     { l: 'Horas', v: elapsed.hrs },
                                     { l: 'Min', v: elapsed.min },
                                     { l: 'Seg', v: elapsed.seg }
                                 ].map((item, i) => (
                                    <div key={item.l} className="flex flex-col items-center relative">
                                        <span className="text-2xl md:text-4xl font-light tabular-nums">{item.v || 0}</span>
                                        <span className="text-[10px] uppercase tracking-widest text-slate-500 mt-2">{item.l}</span>
                                        {i !== 5 && <div className="hidden md:block absolute -right-6 top-2 text-slate-700">:</div>}
                                    </div>
                                 ))}
                            </div>
                        </div>
                    </header>

                    {/* INTERACTIVE DECK */}
                    <section className="relative w-full flex flex-col items-center justify-center min-h-[600px] mb-20">
                         <div className="relative w-full max-w-[320px] md:max-w-sm h-[500px] flex items-center justify-center perspective-1000">
                             {cards.map((card, index) => (
                                 <PolaroidCard 
                                    key={card.id} 
                                    data={card} 
                                    index={index} 
                                    total={cards.length} 
                                    onRemove={removeCard} 
                                 />
                             ))}
                             
                             {cards.length === 0 && (
                                 <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center"
                                 >
                                    <p className="text-slate-400 font-dancing text-2xl mb-4">¡Tantas historias por contar!</p>
                                    <button 
                                        onClick={() => setCards(MEMORIES)}
                                        className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors text-white border border-white/20"
                                    >
                                        Ver de nuevo
                                    </button>
                                 </motion.div>
                             )}
                        </div>
                        <p className="mt-8 text-slate-500 text-sm flex items-center gap-2 animate-bounce">
                           ← Desliza las fotos →
                        </p>
                    </section>

                    {/* INFINITE GALLERY (Masonry) */}
                    <section className="w-full pt-12 border-t border-slate-800/50">
                        <div className="text-center mb-12">
                            <h3 className="font-playfair text-3xl text-white mb-2">Nuestra Galería Infinita</h3>
                            <p className="text-slate-400 font-dancing text-lg">Pequeños instantes, grandes recuerdos</p>
                        </div>
                        
                        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 px-2">
                            {GALLERY_PHOTOS.map((src, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ delay: i % 3 * 0.1, duration: 0.8 }}
                                    className="break-inside-avoid relative group rounded-lg overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                                    <img 
                                        src={src} 
                                        alt="Recuerdo" 
                                        className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                        loading="lazy"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    <footer className="mt-24 text-center text-slate-600 text-xs">
                        <p>Creado con amor para Cami ❤️</p>
                    </footer>

                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default NuestraHistoria;
