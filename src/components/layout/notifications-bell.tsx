"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/actions";
import { Button } from "@/components/ui/button";
import { cn, formatDateTime } from "@/lib/utils";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
};

export function NotificationsBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  async function loadNotifications() {
    setLoading(true);
    try {
      const data = await getNotifications();
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  async function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      await loadNotifications();
    }
  }

  async function handleItemClick(notification: NotificationItem) {
    if (!notification.read) {
      await markNotificationRead(notification.id);
      setUnreadCount((c) => Math.max(0, c - 1));
      setItems((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
      );
    }
    setOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    setUnreadCount(0);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notificações"
        aria-expanded={open}
        onClick={handleToggle}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-popover shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Notificações</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:underline"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                Carregando...
              </p>
            )}
            {!loading && items.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                Nenhuma notificação
              </p>
            )}
            {!loading &&
              items.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleItemClick(notification)}
                  className={cn(
                    "w-full border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                    !notification.read && "bg-primary/5",
                  )}
                >
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatDateTime(notification.createdAt)}
                  </p>
                </button>
              ))}
          </div>
          <div className="border-t border-border px-4 py-2">
            <Link
              href="/agenda"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Ver agenda →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
