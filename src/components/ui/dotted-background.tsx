"use client";
import { cn } from "@/lib/utils";
import { useMotionValue, motion, useMotionTemplate } from "framer-motion";
import React from "react";

interface DottedBackgroundProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  interactive?: boolean;
  density?: 'light' | 'medium' | 'heavy';
}

export const DottedBackground = ({
  children,
  className,
  containerClassName,
  interactive = true,
  density = 'medium'
}: DottedBackgroundProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Different density patterns
  const getDotPatterns = (size: string, spacing: string) => ({
    light: {
      default: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${spacing} ${spacing}' width='${size}' height='${size}' fill='none'%3E%3Ccircle fill='%23e5e5e5' id='pattern-circle' cx='${parseInt(spacing)/2}' cy='${parseInt(spacing)/2}' r='1'%3E%3C/circle%3E%3C/svg%3E")`,
      hover: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${spacing} ${spacing}' width='${size}' height='${size}' fill='none'%3E%3Ccircle fill='%236366f1' id='pattern-circle' cx='${parseInt(spacing)/2}' cy='${parseInt(spacing)/2}' r='1.5'%3E%3C/circle%3E%3C/svg%3E")`,
    },
    dark: {
      default: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${spacing} ${spacing}' width='${size}' height='${size}' fill='none'%3E%3Ccircle fill='%23404040' id='pattern-circle' cx='${parseInt(spacing)/2}' cy='${parseInt(spacing)/2}' r='1'%3E%3C/circle%3E%3C/svg%3E")`,
      hover: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${spacing} ${spacing}' width='${size}' height='${size}' fill='none'%3E%3Ccircle fill='%238183f4' id='pattern-circle' cx='${parseInt(spacing)/2}' cy='${parseInt(spacing)/2}' r='1.5'%3E%3C/circle%3E%3C/svg%3E")`,
    },
  });

  const densitySettings = {
    light: { size: '20', spacing: '40' },
    medium: { size: '16', spacing: '32' },
    heavy: { size: '12', spacing: '24' }
  };

  const dotPatterns = getDotPatterns(
    densitySettings[density].size,
    densitySettings[density].spacing
  );

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    if (!currentTarget || !interactive) return;
    const { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn(
        "relative w-full",
        interactive && "group",
        containerClassName
      )}
      onMouseMove={handleMouseMove}
    >
      {/* Default dot pattern - light mode */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30 dark:hidden"
        style={{
          backgroundImage: dotPatterns.light.default,
        }}
      />
      
      {/* Default dot pattern - dark mode */}
      <div
        className="pointer-events-none absolute inset-0 hidden opacity-30 dark:block"
        style={{
          backgroundImage: dotPatterns.dark.default,
        }}
      />

      {/* Interactive hover effect - light mode */}
      {interactive && (
        <>
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 dark:hidden"
            style={{
              backgroundImage: dotPatterns.light.hover,
              WebkitMaskImage: useMotionTemplate`
                radial-gradient(
                  150px circle at ${mouseX}px ${mouseY}px,
                  black 0%,
                  transparent 100%
                )
              `,
              maskImage: useMotionTemplate`
                radial-gradient(
                  150px circle at ${mouseX}px ${mouseY}px,
                  black 0%,
                  transparent 100%
                )
              `,
            }}
          />
          
          {/* Interactive hover effect - dark mode */}
          <motion.div
            className="pointer-events-none absolute inset-0 hidden opacity-0 transition duration-300 group-hover:opacity-100 dark:block"
            style={{
              backgroundImage: dotPatterns.dark.hover,
              WebkitMaskImage: useMotionTemplate`
                radial-gradient(
                  150px circle at ${mouseX}px ${mouseY}px,
                  black 0%,
                  transparent 100%
                )
              `,
              maskImage: useMotionTemplate`
                radial-gradient(
                  150px circle at ${mouseX}px ${mouseY}px,
                  black 0%,
                  transparent 100%
                )
              `,
            }}
          />
        </>
      )}

      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};
