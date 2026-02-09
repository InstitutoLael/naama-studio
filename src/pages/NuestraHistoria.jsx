import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, Stars, X, ZoomIn, MessageCircle, Plus, Camera } from 'lucide-react';
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
    text: "Ese primer mensaje... Bendita la hora en que me atreví a hablarte.", // Updated text
    rotate: 3,
    isScreenshot: true // Flag to handle object-fit
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
// Note: All verified files in `public/assets/romantic` are `.jpeg`.
// Exception: `Cartafondonegro` is `.heic` on disk. User MUST convert it to `.jpg`.
const GALLERY_MEMORIES = [
  { id: 7, src: "/assets/romantic/Cartafondonegro.jpg", text: "Aún leo lo que me escribiste aquí..." }, 
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
            {/* Logic for Screenshot vs Photo */}
            <img 
                src={data.src} 
                alt="Recuerdo" 
                className={`w-full h-full pointer-events-none select-none ${data.isScreenshot ? 'object-contain bg-black' : 'object-cover'}`} 
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
  const [selectedImage, setSelectedImage] = useState(null); 
  const [playing, setPlaying] = useState(false);

  // META TAGS & PRIVACY
  useEffect(() => {
    const metaRobots = document.createElement('meta');
    metaRobots.name = "robots";
    metaRobots.content = "noindex, nofollow";
    document.head.appendChild(metaRobots);

    const ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.content = "Una historia que no termina...";
    document.head.appendChild(ogTitle);

    const ogDesc = document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    ogDesc.content = "¿Te atreves a recordar? Hay cosas que el tiempo no borra.";
    document.head.appendChild(ogDesc);

    const ogImage = document.createElement('meta');
    ogImage.setAttribute('property', 'og:image');
    ogImage.content = "/assets/romantic/FotoprofesionalBesito.jpeg"; 
    document.head.appendChild(ogImage);

    return () => {
        if(document.head.contains(metaRobots)) document.head.removeChild(metaRobots);
        if(document.head.contains(ogTitle)) document.head.removeChild(ogTitle);
        if(document.head.contains(ogDesc)) document.head.removeChild(ogDesc);
        if(document.head.contains(ogImage)) document.head.removeChild(ogImage);
    };
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
    setPlaying(true);
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

        {/* --- YOUTUBE PLAYER (Hidden) --- */}
        <div className="hidden">
            <ReactPlayer 
                url='https://www.youtube.com/watch?v=USDX0X-d588'
                playing={playing}
                loop={true}
                volume={0.5}
                width="0"
                height="0"
                config={{
                    youtube: {
                        playerVars: { showinfo: 0, controls: 0, modestbranding: 1 }
                    }
                }}
            />
        </div>

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
                            className="px-12 py-4 bg-gradient-to-r from-rose-500 to-amber-600 rounded-full text-white font-playfair tracking-widest text-xl shadow-lg z-10"
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
                    <div className="text-center mb-12">
                        <Heart className="w-8 h-8 text-rose-500 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]" fill="#f43f5e" />
                        <h2 className="font-playfair text-3xl text-white drop-shadow-lg shadow-black">Nuestra Historia</h2>
                        <div className="font-mono text-amber-100 mt-4 text-lg drop-shadow-lg shadow-black font-bold">
                            {elapsed.yrs} Años • {elapsed.mos} Meses • {elapsed.dias} Días
                        </div>
                    </div>

                    {/* SECTION 1: INTERACTIVE DECK (Los Hilos del Destino) */}
                    <section className="relative w-full flex flex-col items-center justify-center min-h-[550px] mb-24">
                        <h3 className="font-dancing text-2xl text-slate-300 mb-8 drop-shadow-lg shadow-black">Los Hilos del Destino</h3>
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
                        <p className="mt-8 text-slate-400 text-xs animate-bounce drop-shadow-md">← Desliza →</p>
                    </section>

                    {/* SECTION 2: NUESTRO UNIVERSO (Infinite Masonry) */}
                    <section className="w-full pt-12 border-t border-slate-800/50">
                        <div className="text-center mb-16">
                            <h3 className="font-playfair text-3xl md:text-5xl text-white mb-4 drop-shadow-lg shadow-black">Nuestro Universo</h3>
                            <p className="text-slate-300 font-dancing text-xl drop-shadow-lg shadow-black">Cada foto, un tesoro.</p>
                        </div>
                        
                        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 px-2">
                            {GALLERY_MEMORIES.map((photo, i) => (
                                <motion.div
                                    key={photo.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.6, delay: i % 4 * 0.1 }}
                                    className="break-inside-avoid relative group rounded-lg overflow-hidden cursor-zoom-in shadow-xl"
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
                    <section className="mt-32 max-w-4xl mx-auto px-4">
                         
                        {/* Dedication Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-[#fffdf5] p-8 md:p-12 shadow-2xl rotate-1 max-w-lg mx-auto mb-20 relative"
                        >
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/20 backdrop-blur-sm border-l border-r border-white/50 -rotate-1 shadow-sm"></div>
                            <h4 className="font-dancing text-3xl text-gray-800 mb-4 font-bold text-center">Hoy es 10...</h4>
                            <p className="font-dancing text-xl text-gray-800 leading-relaxed text-center">
                                "Sé que técnicamente no estamos contando... pero mi corazón no sabe de pausas. Feliz día, Cami."
                            </p>
                        </motion.div>

                        {/* Empty Frames */}
                        <div className="text-center mb-12">
                            <h3 className="font-playfair text-2xl text-white/90 italic mb-8 drop-shadow-lg shadow-black">¿Y si llenamos estos espacios?</h3>
                            
                            <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
                                {/* Frame 1 */}
                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="w-64 h-80 border-2 border-dashed border-white/40 rounded-lg flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm p-6 text-center group transition-colors hover:border-white/60 shadow-lg"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 text-white/50 group-hover:text-white group-hover:bg-white/20 transition-all">
                                        <Camera size={24} />
                                    </div>
                                    <p className="font-playfair text-white/90 text-lg drop-shadow-md">10 de Marzo (Reservado)</p>
                                    <span className="text-xs text-rose-300 uppercase tracking-widest mt-2 drop-shadow-md">(Nuestro Aniversario)</span>
                                </motion.div>

                                {/* Frame 2 */}
                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="w-64 h-80 border-2 border-dashed border-white/40 rounded-lg flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm p-6 text-center group transition-colors hover:border-white/60 shadow-lg"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 text-white/50 group-hover:text-white group-hover:bg-white/20 transition-all">
                                        <Plus size={24} />
                                    </div>
                                    <p className="font-playfair text-white/90 text-lg drop-shadow-md">Nuestra próxima aventura...</p>
                                    <span className="text-xs text-amber-200 uppercase tracking-widest mt-2 font-dancing drop-shadow-md">Tú eliges</span>
                                </motion.div>
                            </div>
                        </div>
                    </section>

                    {/* FINAL CTA & WHATSAPP BUTTON */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="mt-24 mb-24 text-center max-w-lg mx-auto px-6"
                    >
                        <p className="font-playfair text-2xl md:text-3xl text-white mb-4 leading-relaxed drop-shadow-lg shadow-black">
                            ¿Viste todo lo que hemos construido?<br/>
                            <span className="text-rose-400 italic">Aún quedan muchas páginas en blanco... pero esas se escriben de a dos.<br/>Sin prisa, pero con ganas.</span>
                        </p>
                        <p className="font-dancing text-4xl text-amber-100 mt-8 mb-12 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">Te espero.</p>

                        <a 
                            href="https://wa.me/56949481562?text=Escribamos%20el%20siguiente%20capítulo..."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-full font-playfair tracking-normal text-lg transition-all shadow-lg hover:shadow-emerald-500/30 group mb-8"
                        >
                            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Escribir el siguiente capítulo...
                        </a>

                        {/* Easter Egg */}
                        <p className="text-[10px] text-white/30 italic font-serif">
                            PD: El silencio otorga... y ese corazón rojo lo dijo todo.
                        </p>
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
                    <motion.div 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
                    >
                         <img 
                            src={selectedImage.src} 
                            className="max-w-full max-h-[80vh] object-contain rounded-sm shadow-2xl"
                        />
                        {/* Display caption if it exists */}
                        {selectedImage.text && (
                             <p className="mt-4 text-white font-dancing text-2xl drop-shadow-lg text-center px-4 bg-black/30 backdrop-blur-md py-2 rounded-full">
                                {selectedImage.text}
                             </p>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default NuestraHistoria;
