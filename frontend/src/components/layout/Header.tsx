"use client";

import React from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'motion/react';
import {
  Bell, Search, Sun, Moon, User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNotificationStore } from '@/stores/notification-store';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border w-80">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search grid nodes, alerts, transformers..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-background border border-border rounded">
            ⌘K
          </kbd>
        </div>

        {/* Spacer for mobile */}
        <div className="md:hidden w-10" />

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Live Status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-600 dark:text-green-400">LIVE</span>
          </div>

          {/* Theme Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-xl hover:bg-accent transition-colors relative"
            aria-label="Toggle theme"
          >
            <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-4 h-4 top-2.5 left-2.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </motion.button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger className="relative p-2.5 rounded-xl hover:bg-accent transition-colors">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-[9px] text-white font-bold flex items-center justify-center"
                >
                  {unreadCount}
                </motion.span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-3 py-2">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto">
                {notifications.slice(0, 5).map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={cn(
                      "flex flex-col items-start gap-1 p-3 cursor-pointer",
                      !notif.read && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Badge
                        variant={notif.type === 'error' ? 'destructive' : 'secondary'}
                        className="text-[10px] h-4"
                      >
                        {notif.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs font-medium">{notif.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-accent transition-colors">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  QG
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
