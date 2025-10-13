import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScaleOnHoverProps {
  children: ReactNode;
  scale?: number;
  rotate?: number;
  duration?: number;
  className?: string;
}

export function ScaleOnHover({
  children,
  scale = 1.05,
  rotate = 0,
  duration = 0.3,
  className = "",
}: ScaleOnHoverProps) {
  return (
    <motion.div
      whileHover={{ scale, rotate }}
      transition={{ duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
