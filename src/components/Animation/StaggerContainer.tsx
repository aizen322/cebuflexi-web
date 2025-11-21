import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

interface StaggerContainerProps {
  children: ReactNode;
  delayChildren?: number;
  staggerChildren?: number;
  className?: string;
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function StaggerContainer({
  children,
  delayChildren = 0.2,
  staggerChildren = 0.1,
  className = "",
}: StaggerContainerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Ensure animation triggers on mount/refresh
    setIsMounted(true);
  }, []);

  return (
    <motion.div
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren,
            staggerChildren,
          },
        },
      }}
      initial="hidden"
      animate={isMounted ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
