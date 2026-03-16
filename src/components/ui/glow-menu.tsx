'use client';

import * as React from 'react';
import Link from 'next/link';
import { HTMLMotionProps, motion, type Transition, type Variants } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MenuItem {
  icon: LucideIcon | React.FC<{ className?: string }>;
  label: string;
  href: string;
  gradient: string;
  iconColor: string;
}

interface MenuBarProps extends HTMLMotionProps<'nav'> {
  items: MenuItem[];
  activeItem?: string;
  onItemClick?: (label: string) => void;
}

const transitionEase = [0.4, 0, 0.2, 1] as const;

const itemVariants: Variants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
};

const backVariants: Variants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
};

const glowVariants: Variants = {
  initial: { opacity: 0, scale: 0.82 },
  hover: {
    opacity: 1,
    scale: 1.2,
    transition: {
      opacity: { duration: 0.35, ease: transitionEase },
      scale: { duration: 0.45, type: 'spring', stiffness: 260, damping: 22 },
    },
  },
};

const navGlowVariants: Variants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: transitionEase,
    },
  },
};

const sharedTransition: Transition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 20,
  duration: 0.5,
};

export const MenuBar = React.forwardRef<HTMLElement, MenuBarProps>(
  ({ className, items, activeItem, onItemClick, ...props }, ref) => {
    const { resolvedTheme } = useTheme();
    const isDarkTheme = resolvedTheme === 'dark';

    return (
      <motion.nav
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-background/95 via-background/80 to-background/55 p-2 shadow-[0_10px_40px_-18px_rgba(0,0,0,0.45)] backdrop-blur-xl',
          className,
        )}
        initial="initial"
        whileHover="hover"
        {...props}
      >
        <motion.div
          className="pointer-events-none absolute -inset-8 rounded-[2rem]"
          variants={navGlowVariants}
          style={{
            background: isDarkTheme
              ? 'radial-gradient(circle at top, rgba(59,130,246,0.22), rgba(168,85,247,0.14) 35%, rgba(244,63,94,0.08) 65%, transparent 80%)'
              : 'radial-gradient(circle at top, rgba(59,130,246,0.14), rgba(168,85,247,0.1) 35%, rgba(244,63,94,0.05) 65%, transparent 80%)',
          }}
        />
        <ul className="relative z-10 flex items-center gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === activeItem;

            return (
              <motion.li key={item.label} className="relative">
                <Link href={item.href as any} onClick={() => onItemClick?.(item.label)} className="block w-full">
                  <motion.div
                    className="group relative block overflow-visible rounded-xl"
                    style={{ perspective: '600px' }}
                    whileHover="hover"
                    initial="initial"
                    animate={isActive ? 'hover' : 'initial'}
                  >
                    <motion.div
                      className="pointer-events-none absolute inset-0 z-0 rounded-[16px] blur-xl"
                      variants={glowVariants}
                      style={{
                        background: item.gradient,
                        opacity: isActive ? 1 : 0,
                      }}
                    />
                    <motion.div
                      className={cn(
                        'relative z-10 flex items-center gap-2 rounded-xl border border-transparent bg-white/[0.02] px-4 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                          : 'text-muted-foreground group-hover:text-foreground',
                      )}
                      variants={itemVariants}
                      transition={sharedTransition}
                      style={{
                        transformStyle: 'preserve-3d',
                        transformOrigin: 'center bottom',
                      }}
                    >
                      <span className={cn('transition-all duration-300', isActive && item.iconColor, !isActive && 'group-hover:scale-110')}>
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span>{item.label}</span>
                    </motion.div>
                    <motion.div
                      className={cn(
                        'absolute inset-0 z-10 flex items-center gap-2 rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'text-foreground'
                          : 'text-muted-foreground group-hover:text-foreground',
                      )}
                      variants={backVariants}
                      transition={sharedTransition}
                      style={{
                        transformStyle: 'preserve-3d',
                        transformOrigin: 'center top',
                        rotateX: 90,
                      }}
                    >
                      <span className={cn('transition-all duration-300', isActive && item.iconColor, !isActive && 'group-hover:scale-110')}>
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span>{item.label}</span>
                    </motion.div>
                  </motion.div>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </motion.nav>
    );
  }
);

MenuBar.displayName = 'MenuBar';

export type { MenuBarProps, MenuItem };
