"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "80px 16px", overflowY: "auto",
      }}
    >
      <div style={{
        background: "var(--color-bg)", borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)", width: "100%", maxWidth: 600,
        padding: "var(--space-lg)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-md)" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 400, color: "var(--color-heading)", margin: 0 }}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)",
              width: 32, height: 32, cursor: "pointer", fontSize: "1rem", color: "var(--color-body)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
