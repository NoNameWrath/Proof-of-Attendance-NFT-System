import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

function CountUp({ target, duration = 1500 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{count}</span>;
}

const stats = [
  { label: 'Events hosted', value: 42, suffix: '+' },
  { label: 'Badges minted', value: 830, suffix: '+' },
  { label: 'Network', value: null, display: 'Solana' },
];

export default function StatsSection() {
  return (
    <section className="py-16 bg-black border-y border-zinc-800/50">
      <div className="container-px mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="text-3xl sm:text-4xl font-extrabold gradient-text">
                {stat.value !== null ? (
                  <><CountUp target={stat.value} />{stat.suffix}</>
                ) : (
                  stat.display
                )}
              </div>
              <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
