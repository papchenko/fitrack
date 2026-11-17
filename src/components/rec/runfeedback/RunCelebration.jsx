import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import "./runcelebration.scss";

export default function RunCelebration({ emoji, onComplete }) {
  // Keep the existing API; the celebration deliberately uses no emoji.
  const reducedMotion = useReducedMotion();
  const finished = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const complete = () => {
    if (finished.current) return;
    finished.current = true;
    onCompleteRef.current?.();
  };

  const minimal = reducedMotion === true;

  return (
    <div className="run-celebration" role="status" aria-label="Activity complete">
      <motion.div
        className="run-celebration__content"
        initial={{ opacity: 0, scale: minimal ? 1 : 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: minimal ? 0.1 : 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="run-celebration__symbol" aria-hidden="true">
          <motion.svg viewBox="0 0 80 80" fill="none">
            <motion.circle
              cx="40" cy="40" r="34"
              stroke="currentColor" strokeWidth="1.5"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 1, pathLength: 1 }}
              transition={{ duration: minimal ? 0.1 : 0.9, delay: minimal ? 0 : 0.15, ease: "easeInOut" }}
            />
            <motion.path
              d="M24 41L35 52L57 29"
              stroke="currentColor" strokeWidth="3.5"
              strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: minimal ? 0.1 : 0.55, delay: minimal ? 0 : 0.75, ease: "easeOut" }}
            />
          </motion.svg>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: minimal ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: minimal ? 0.1 : 0.8, delay: minimal ? 0 : 1.05, ease: [0.22, 1, 0.36, 1] }}
        >
         <span> ACTIVITY COMPLETE</span>
        </motion.h1>
      </motion.div>

      <motion.div
        className="run-celebration__exit"
        aria-hidden="true"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: minimal ? 0.15 : 0.7, delay: minimal ? 1 : 2.75, ease: [0.76, 0, 0.24, 1] }}
        onAnimationComplete={complete}
      />
    </div>
  );
}
