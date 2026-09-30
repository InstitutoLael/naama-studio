import React, { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, PlusIcon } from './Icons';

const hasValue = (v) => v && v.trim() !== '' && v !== '---';

/** Fila de servicio con precio; se expande para mostrar el detalle. */
const ServiceRow = ({ service }) => {
  const [open, setOpen] = useState(false);
  const id = useId();
  const hasDetail = hasValue(service.desc) || hasValue(service.why);

  return (
    <li className={`srow ${open ? 'is-open' : ''}`}>
      <button
        className="srow__head"
        onClick={() => hasDetail && setOpen((o) => !o)}
        aria-expanded={hasDetail ? open : undefined}
        aria-controls={hasDetail ? id : undefined}
        disabled={!hasDetail}
      >
        <span className="srow__name">{service.name}</span>
        <span className="srow__meta">
          {service.time && <span>{service.time}</span>}
          {service.worker && <span>{service.worker}</span>}
        </span>
        <span className="srow__price">
          {hasValue(service.old) && <s>${service.old}</s>}
          {hasValue(service.price) ? `$${service.price}` : 'Consultar'}
        </span>
        {hasDetail && <PlusIcon className="srow__icon" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            className="srow__detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="srow__detail-inner">
              {hasValue(service.desc) && <p>{service.desc}</p>}
              {hasValue(service.why) && <p className="srow__why">{service.why}</p>}
              <Link to={`/reservar?servicio=${encodeURIComponent(service.name)}`} className="link-arrow">
                Reservar este servicio <ArrowRight />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};

export default ServiceRow;
