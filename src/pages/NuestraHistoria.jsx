import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, Stars, X, ZoomIn, MessageCircle, Plus, Camera, Music, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import '../styles/NuestraHistoria.css';

const START_DATE = new Date('2023-12-10T13:00:00');

// --- DATA: "LOS HILOS DEL DESTINO" (Top 6) ---
const STORY_HIGHLIGHTS = [
  { id: 1, src: "/assets/romantic/FotoprofesionalBesito.jpeg", text: "El Sello: Tú y yo contra el mundo.", rotate: -2 },
  { id: 2, src: "/assets/romantic/PrimerMensajedeWhatsApp.jpeg", text: "Ese primer mensaje... Bendita la hora en que me atreví a escribirte.", rotate: 3, isScreenshot: true },
  { id: 3, src: "/assets/romantic/Cartafondoblanco.jpeg", text: "Tus palabras, tu letra. Guardo esto como mi mayor tesoro.", rotate: -3 },
  { id: 4, src: "/assets/romantic/Fotodespuesdevigilia.jpeg", text: "'Tú sana, que yo pongo la fe en marcha'. Trato hecho.", rotate: 2 },
  { id: 5, src: "/assets/romantic/Primerasfotosjuntos.jpeg", text: "La inocencia del principio. Si supieran lo que venía...", rotate: -4 },
  { id: 6, src: "/assets/romantic/Fotoqueamodeella.jpeg", text: "Simplemente tú. Mi vista favorita.", rotate: 4 },
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

// --- COMPONENT: TIMING COUNTER ---
const TimeCounter = ({ elapsed, total }) => {
    return (
        <div className="nh_time_container">
            <div className="nh_time_grid">
                <TimeBox value={elapsed.yrs} label="Años" colorClass="nh_text_rose_200" />
                <TimeBox value={elapsed.mos} label="Meses" colorClass="nh_text_rose_200" />
                <TimeBox value={elapsed.dias} label="Días" colorClass="nh_text_rose_200" />
            </div>

            <div className="nh_time_grid nh_time_grid_small">
                 <TimeBox value={elapsed.hrs} label="Horas" colorClass="nh_text_amber_100" size="small" />
                 <TimeBox value={elapsed.min} label="Minutos" colorClass="nh_text_amber_100" size="small" />
                 <TimeBox value={elapsed.seg} label="Segundos" colorClass="nh_text_amber_200" size="small" highlight />
            </div>

            <div className="nh_time_perspective">
                <div className="nh_perspective_badge">Lo que eso significa</div>
                <div className="nh_perspective_grid">
                    <CumulativeBox value={total.days} label="Días Totales" />
                    <CumulativeBox value={total.hours} label="Horas de Historia" />
                    <CumulativeBox value={total.seconds} label="Segundos juntos" />
                </div>
            </div>
        </div>
    );
};

const TimeBox = ({ value, label, colorClass, size = "large", highlight = false }) => (
    <div className={`nh_time_box ${size} ${highlight ? 'highlight' : ''}`}>
        <span className={`nh_time_value ${colorClass}`}>
            {String(value || 0).padStart(2, '0')}
        </span>
        <span className="nh_time_label">{label}</span>
    </div>
);

const CumulativeBox = ({ value, label }) => (
    <div className="nh_cumulative_box">
        <span className="nh_cumul_value">
            {new Intl.NumberFormat('es-CL').format(value || 0)}
        </span>
        <span className="nh_cumul_label">{label}</span>
    </div>
);

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
        zIndex: isDragging ? 100 : total - index, 
        rotateZ: data.rotate
      }}
      animate={{ 
          scale: index === 0 ? 1 : 0.95 - index * 0.05, 
          y: index * 10,
      }}
      className="nh_polaroid_wrapper"
    >
      <div className="nh_polaroid_card">
        <div className="nh_polaroid_img_box">
            <div className="nh_polaroid_overlay"></div>
            <img 
                src={data.src} 
                alt="Recuerdo" 
                className={`nh_polaroid_img ${data.isScreenshot ? 'contain' : ''}`} 
                loading="lazy"
            />
        </div>
        
        <div className="nh_polaroid_text_box">
            <p className="nh_polaroid_text">{data.text}</p>
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
  const [selectedImage, setSelectedImage] = useState(null);

  // Protección SEO & Carga dinámica de fuentes
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Dancing+Script:wght@600&display=swap";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(meta);
      document.head.removeChild(link);
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

      setTotalStats({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor(diff / (1000 * 60 * 60)),
          seconds: Math.floor(diff / 1000)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started]);

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
    <div className="nh_page">

        {/* --- FLOATING MUSIC CARD --- */}
        {started && (
             <div className="nh_music_card">
                <a 
                    href="https://youtu.be/USDX0X-d588?si=p7cMXFaTbm3ojJv9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nh_music_link"
                >
                    <div className="nh_music_icon_wrapper">
                        <Music size={20} className="nh_music_icon" />
                        <div className="nh_music_glow"></div>
                    </div>
                    <div className="nh_music_text_col">
                        <span className="nh_music_label">Nuestra Canción</span>
                        <span className="nh_music_title">No Se Va - Morat</span>
                    </div>
                </a>
            </div>
        )}

        {/* --- BACKGROUND --- */}
        <div className="nh_bg_container">
            <div className="nh_bg_gradient"></div>
            <div className="nh_bg_texture"></div>
            <div className="nh_bg_blob_1"></div>
            <div className="nh_bg_blob_2"></div>

            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="nh_bg_particle"
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
                    className="nh_intro_overlay"
                >
                    <Stars className="nh_intro_icon" />
                    <h1 className="nh_intro_title">
                        Cami... <br/>
                        <span className="nh_intro_subtitle">
                            ¿Seguimos escribiendo esta historia?
                        </span>
                    </h1>

                    <div className="nh_intro_actions">
                         <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleYes}
                            className="nh_yes_btn"
                        >
                            SÍ
                        </motion.button>

                        <motion.button
                            onMouseEnter={moveNoButton}
                            onTouchStart={moveNoButton}
                            animate={{ x: noBtnPos.x, y: noBtnPos.y }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="nh_no_btn"
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
                    className="nh_main_content"
                >
                    {/* Header */}
                    <div className="nh_header">
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        >
                             <Heart className="nh_header_icon" fill="#f43f5e" />
                        </motion.div>
                        <h2 className="nh_header_title">Nuestra Historia</h2>
                        <TimeCounter elapsed={elapsed} total={totalStats} />
                    </div>

                    {/* SECTION 1: INTERACTIVE DECK */}
                    <section className="nh_deck_section">
                        <h3 className="nh_section_title">Los Hilos del Destino</h3>
                        <div className="nh_deck_container">
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
                        <p className="nh_deck_hint">← Desliza →</p>
                    </section>

                    {/* SECTION 2: NUESTRO UNIVERSO */}
                    <section className="nh_universe_section">
                        <div className="nh_universe_header">
                            <h3 className="nh_universe_title">Nuestro Universo</h3>
                            <p className="nh_universe_subtitle">Cada recuerdo es eterno.</p>
                        </div>
                        
                        <div className="nh_masonry_grid">
                            {GALLERY_MEMORIES.map((photo, i) => (
                                <motion.div
                                    key={photo.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.6, delay: i % 4 * 0.1 }}
                                    className="nh_masonry_item"
                                    onClick={() => setSelectedImage(photo)} 
                                >
                                    <div className="nh_masonry_overlay">
                                        <ZoomIn className="nh_zoom_icon" size={32} />
                                    </div>
                                    <img 
                                        src={photo.src} 
                                        alt="Recuerdo" 
                                        className="nh_masonry_img"
                                        loading="lazy"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* SECTION 3: DEDICATION & EMPTY FRAMES */}
                    <section className="nh_future_section">
                         
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="nh_dedication_card"
                        >
                            <div className="nh_tape"></div>
                            <h4 className="nh_dedication_title">10 de Diciembre</h4>
                            <p className="nh_dedication_text">
                                "Sé que técnicamente no estamos contando... pero mi corazón no sabe de pausas. Feliz día, Cami."
                            </p>
                            
                            <div className="nh_dedication_action">
                                <button 
                                    onClick={() => setShowLetter(true)}
                                    className="nh_read_more_btn"
                                >
                                    Leer algo más...
                                </button>
                            </div>
                        </motion.div>

                        <div className="nh_empty_frames_container">
                            <h3 className="nh_frames_title">Lo que está por venir...</h3>
                            
                            <div className="nh_frames_grid">
                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="nh_frame rose"
                                >
                                    <div className="nh_frame_gradient_rose"></div>
                                    <div className="nh_frame_content">
                                        <div className="nh_frame_icon_box">
                                            <Camera size={28} />
                                        </div>
                                        <p className="nh_frame_title">Próximo 10 de Diciembre</p>
                                        <span className="nh_frame_subtitle rose">Aniversario Oficial</span>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="nh_frame amber"
                                >
                                     <div className="nh_frame_gradient_amber"></div>
                                     <div className="nh_frame_content">
                                        <div className="nh_frame_icon_box">
                                            <Plus size={28} />
                                        </div>
                                        <p className="nh_frame_title">Próxima Aventura</p>
                                        <span className="nh_frame_subtitle amber">Destino: Desconocido</span>
                                     </div>
                                </motion.div>
                            </div>
                        </div>
                    </section>

                    {/* FINAL CTA */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="nh_cta_section"
                    >
                        <div className="nh_divider"></div>
                        <p className="nh_cta_text">
                            <span className="nh_cta_sub">¿Viste todo lo que hemos construido?</span>
                            "Aún quedan muchas páginas en blanco...<br/>pero esas se escriben de a dos."
                        </p>
                        <p className="nh_cta_hint">Sin prisa, pero con ganas.</p>

                        <a 
                            href="https://wa.me/56949481562?text=Escribamos%20el%20siguiente%20capítulo..."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="nh_whatsapp_btn"
                        >
                            <MessageCircle className="nh_whatsapp_icon" size={24} />
                            Escribir el siguiente capítulo...
                        </a>

                        <div className="nh_easter_egg">
                             <Heart size={14} className="nh_easter_heart" />
                             <p className="nh_easter_text">"Lo mío es fe."</p>
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
                    className="nh_modal_overlay"
                    onClick={() => setShowLetter(false)}
                >
                    <motion.div 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="nh_letter_card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setShowLetter(false)}
                            className="nh_modal_close"
                        >
                            <X size={24} />
                        </button>

                        <div className="nh_letter_header">
                            <Heart size={20} className="nh_letter_heart" />
                            <h3 className="nh_letter_title">Desde el Corazón</h3>
                        </div>

                        <div className="nh_letter_body">
                            <p>
                                Sé que es una lucha muy grande cuando la cabeza dice una cosa y el corazón siente otra…
                            </p>
                            <p>
                                Respeto tu decisión y tu espacio. Pero por mi parte, ya no me muevo por mis propias fuerzas... porque si fuera solo por mí, quizás ya me habría rendido hace rato.
                            </p>
                            <p className="nh_letter_highlight">
                                Lo mío es fe, y esa no siempre entiende de lógica humana.
                            </p>
                            <p>
                                No pretendo incomodarte, solo quería que supieras que aquí sigo, construyendo, esperando y creyendo.
                            </p>
                        </div>

                        <div className="nh_letter_footer">
                            <p className="nh_letter_sign">Diego.</p>
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
                    className="nh_lb_overlay"
                    onClick={() => setSelectedImage(null)}
                >
                    <button className="nh_lb_close">
                        <X size={32} />
                    </button>
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="nh_lb_content"
                        onClick={(e) => e.stopPropagation()}
                    >
                         <img 
                            src={selectedImage.src} 
                            className="nh_lb_img"
                            loading="lazy"
                        />
                        {selectedImage.text && (
                             <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                delay={0.2}
                                className="nh_lb_caption_box"
                             >
                                <p className="nh_lb_caption">
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
