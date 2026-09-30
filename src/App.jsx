import React, { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/site/Navbar';
import Footer from './components/site/Footer';
import Preloader from './components/site/Preloader';
import FloatingWhatsApp from './components/site/FloatingWhatsApp';
import Home from './pages/Home';
import { legacyMundoIds } from './data/categories';
import { scrollToElement, scrollToTop } from './lib/smoothScroll';

const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const WorldPage = lazy(() => import('./pages/WorldPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const BookingFlow = lazy(() => import('./pages/BookingFlow'));
const GiftCardsPage = lazy(() => import('./pages/GiftCardsPage'));
const EmpresasPage = lazy(() => import('./pages/EmpresasPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

const LegacyMundo = () => {
  const { mundoId } = useParams();
  return <Navigate to={`/servicios/${legacyMundoIds[mundoId] ?? mundoId}`} replace />;
};

const EASE = [0.16, 1, 0.3, 1];

const App = () => {
  const location = useLocation();

  // Si la URL trae un ancla (#seccion), bajar hasta ella cuando la página ya está montada.
  useEffect(() => {
    if (!location.hash) return undefined;
    const t = setTimeout(() => scrollToElement(document.querySelector(location.hash), -80), 450);
    return () => clearTimeout(t);
  }, [location.pathname, location.hash]);

  return (
    <>
      <a href="#contenido" className="skip-link">Saltar al contenido</a>
      <Preloader />
      <Navbar />

      {/* Volvemos arriba justo cuando la página anterior terminó de salir. */}
      <AnimatePresence mode="wait" initial={false} onExitComplete={() => scrollToTop()}>
        <motion.main
          id="contenido"
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6, ease: EASE } }}
          exit={{ opacity: 0, transition: { duration: 0.3, ease: EASE } }}
        >
          <Suspense fallback={<div className="page-fallback" />}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/servicios" element={<ServicesPage />} />
              <Route path="/servicios/:mundoId" element={<WorldPage />} />
              <Route path="/equipo" element={<TeamPage />} />
              <Route path="/galeria" element={<GalleryPage />} />
              <Route path="/reservar" element={<BookingFlow />} />
              <Route path="/gift-cards" element={<GiftCardsPage />} />
              <Route path="/empresas" element={<EmpresasPage />} />
              <Route path="/contacto" element={<ContactPage />} />
              {/* Enlaces antiguos */}
              <Route path="/staff" element={<Navigate to="/servicios" replace />} />
              <Route path="/mundo/:mundoId" element={<LegacyMundo />} />
              <Route path="/nuestra-historia" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </motion.main>
      </AnimatePresence>

      <Footer />
      <FloatingWhatsApp />
    </>
  );
};

export default App;
