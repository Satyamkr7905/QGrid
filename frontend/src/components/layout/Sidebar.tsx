"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Map, ShieldAlert, Atom, Cpu, Leaf,
  ShieldCheck, ChevronLeft, ChevronRight, Zap, Menu, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Map, ShieldAlert, Atom, Cpu, Leaf, ShieldCheck,
};

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg glass-card lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed top-0 left-0 h-full z-50 flex flex-col",
          "bg-sidebar border-r border-sidebar-border",
          "transition-all duration-300 ease-in-out",
          "lg:relative lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-[72px]" : "w-[260px]",
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 shrink-0">
            <Zap className="w-5 h-5 text-primary" />
            <div className="absolute inset-0 rounded-xl animate-pulse-glow opacity-30" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h1 className="text-lg font-bold text-gradient">Q-Grid Shield</h1>
                <p className="text-[10px] text-muted-foreground -mt-1">Smart Grid Management</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto lg:hidden p-1 rounded-md hover:bg-accent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl",
                  "transition-all duration-200 relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {Icon && (
                  <Icon className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                )}
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium overflow-hidden whitespace-nowrap"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle (desktop only) */}
        <div className="hidden lg:flex items-center justify-center p-3 border-t border-sidebar-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Status indicator */}
        <div className={cn(
          "px-4 py-3 border-t border-sidebar-border",
          collapsed && "px-2"
        )}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
            {!collapsed && (
              <span className="text-xs text-muted-foreground">System Operational</span>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
