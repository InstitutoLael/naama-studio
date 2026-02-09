import React, { useState, useEffect, useRef } from 'react';

import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

const START_DATE = new Date('2023-12-10T13:00:00');

// --- DATA: CARTAS/POLAROIDS ---
const CARDS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1517260739337-6799d239ce83?q=80&w=800&auto=format&fit=crop", // Couple holding hands / night
    text: "Orar juntos por WhatsApp... mi momento favorito del día.",
    date: "03.07.2023"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1554672408-730436b60dde?q=80&w=800&auto=format&fit=crop", // McDonald's vibes / fries
    text: "Nuestra primera cita... McDonald's y una Coca-Cola bien helada (con hielo, obvio).",
    date: "Primera Cita"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop", // Letter / Writing
    text: "Aquel 10 de Diciembre de 2023, 13:00 hrs... cuando todo cambió.",
    date: "10.12.2023"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=800&auto=format&fit=crop", // Church / Light
    text: "El culto de las 12... donde pedí por ti.",
    date: "Fe"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?q=80&w=800&auto=format&fit=crop", // Holding hands strong
    text: "Tú sana, que yo pongo la fe en marcha. Trato hecho.",
    date: "Promesa"
  }
];

// --- COMPONENT: DRAGGABLE CARD ---
const CardResult = ({ data, index, total, onRemove }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 150], [-10, 10]);
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  
  // Random slight rotation for the stack look
  const randomRotate = useRef(Math.random() * 6 - 3); // -3 to 3 deg

  const handleDragEnd = (event, info) => {
    if (Math.abs(info.offset.x) > 100) {
      onRemove(data.id);
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{ 
        x, 
        rotate: rotate, 
        opacity,
        zIndex: total - index,
        rotateZ: randomRotate.current 
      }}
      onDragEnd={handleDragEnd}
      animate={{ scale: index === 0 ? 1 : 0.95 - index * 0.05, y: index * 10 }}
      className="absolute top-0 left-0 w-full max-w-sm mx-auto cursor-grab active:cursor-grabbing"
    >
      <div className="bg-white p-3 pb-12 shadow-2xl shadow-black/50 transform transition-transform hover:scale-[1.02]">
        <div className="aspect-[3/4] overflow-hidden bg-gray-100 mb-4 relative">
            <div className="absolute inset-0 bg-slate-900/5 mix-blend-multiply"></div>
            <img src={data.image} alt="Memory" className="w-full h-full object-cover pointer-events-none" />
        </div>
        
        <div className="absolute bottom-4 left-0 right-0 text-center px-4">
            <p className="font-dancing text-xl text-slate-600 mb-1">{data.text}</p>
            <p className="font-sans text-[10px] text-slate-400 uppercase tracking-widest">{data.date}</p>
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
  const [cards, setCards] = useState(CARDS);
  const [elapsed, setElapsed] = useState({});

  // Privacy: No Index
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
        years: Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)),
        months: Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44)),
        days: Math.floor((diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started]);

  // "No" Button Logic
  const moveNoButton = () => {
    const x = Math.random() * (window.innerWidth - 200);
    const y = Math.random() * (window.innerHeight - 100);
    setNoBtnPos({ x, y });
    
    const phrases = ["¡Muy lenta!", "¡Ups, se escapó!", "Inténtalo de nuevo", "El destino dice que no", "¡Tramposa!"];
    setNoBtnText(phrases[Math.floor(Math.random() * phrases.length)]);
  };

  const handleYes = () => {
    setStarted(true);
  };



  const removeCard = (id) => {
      setCards(prev => {
          const newCards = prev.filter(c => c.id !== id);
          if (newCards.length === 0) {
              setTimeout(() => setCards(CARDS), 1000); // Reset stack if empty
          }
          return newCards;
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden relative selection:bg-rose-500/30">

        {/* --- BACKGROUND PARTICLES --- */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950"></div>
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-white rounded-full opacity-20"
                    initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, scale: Math.random() * 0.5 }}
                    animate={{ y: [null, Math.random() * -100] }}
                    transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: "linear" }}
                    style={{ width: Math.random() * 3 + 1, height: Math.random() * 3 + 1 }}
                />
            ))}
        </div>

        <AnimatePresence>
            {!started ? (
                // --- INTRO PHASE ---
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                    transition={{ duration: 1 }}
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center"
                >
                    <h1 className="font-playfair text-4xl md:text-6xl mb-8 leading-tight tracking-tight drop-shadow-lg">
                        Cami... <br/>
                        <span className="text-2xl md:text-3xl font-light text-slate-400 block mt-4 font-sans">
                            Hay cosas que no se borran,<br/> solo se guardan esperando su momento.
                        </span>
                    </h1>

                    <div className="flex gap-8 items-center mt-12 relative h-20 w-full justify-center">
                         <button 
                            onClick={handleYes}
                            className="px-10 py-3 border border-amber-200/50 text-amber-100 font-playfair tracking-widest text-lg hover:bg-amber-500/10 hover:border-amber-400 transition-all duration-500 shadow-[0_0_15px_rgba(251,191,36,0.1)] hover:shadow-[0_0_25px_rgba(251,191,36,0.3)]">
                            SÍ
                        </button>

                        <button
                            onMouseEnter={moveNoButton}
                            onTouchStart={moveNoButton}
                            style={{ 
                                position: noBtnPos.x ? 'absolute' : 'relative', 
                                left: noBtnPos.x, 
                                top: noBtnPos.y 
                            }}
                            className="px-6 py-3 text-slate-600 font-sans text-sm tracking-widest hover:text-slate-400 transition-colors duration-300"
                        >
                            {noBtnText}
                        </button>
                    </div>
                </motion.div>
            ) : (
                // --- MAIN PHASE ---
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 0.5, duration: 1.5 }}
                    className="relative z-10 min-h-screen flex flex-col items-center py-12 px-4"
                >
                    {/* Header / Counter */}
                    <div className="text-center mb-12">
                        <p className="font-dancing text-2xl text-slate-400 mb-6">El tiempo pasa, pero lo nuestro sigue contando...</p>
                        
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-8 font-mono text-slate-200">
                             {['years', 'months', 'days', 'hours', 'minutes', 'seconds'].map((unit, i) => (
                                <div key={unit} className="flex flex-col items-center">
                                    <span className="text-3xl md:text-4xl font-light">{elapsed[unit] || 0}</span>
                                    <span className="text-[10px] uppercase tracking-widest text-slate-600 mt-1">{unit}</span>
                                </div>
                             ))}
                        </div>
                    </div>

                    {/* Draggable Deck */}
                    <div className="relative w-full max-w-sm h-[500px] flex items-center justify-center perspective-1000">
                         {cards.map((card, index) => (
                             <CardResult 
                                key={card.id} 
                                data={card} 
                                index={index} 
                                total={cards.length} 
                                onRemove={removeCard} 
                             />
                         ))}
                         {cards.length === 0 && (
                             <div className="text-slate-500 font-dancing text-xl">Reiniciando recuerdos...</div>
                         )}
                    </div>

                    <div className="mt-12 text-center max-w-md">
                        <p className="text-slate-500 text-sm italic">Desliza las fotos hacia los lados...</p>
                    </div>



                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default NuestraHistoria;
