import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export function GetStartedButton({
  text = "Get Started",
  onClick,
  className = "",
}: {
  text?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Button
      onClick={onClick}
      className={`group relative overflow-hidden font-semibold transition-all ${className}`}
      size="lg"
      style={{
        position: 'relative',
        overflow: 'hidden',
        paddingRight: '3.5rem',
        backgroundColor: '#211913',
        color: '#fff',
        border: '1px solid rgba(212, 163, 115, 0.3)',
        borderRadius: '12px',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          transition: 'opacity 500ms ease',
        }}
        className="transition-opacity duration-500 group-hover:opacity-0"
      >
        {text}
      </span>
      <i
        style={{
          position: 'absolute',
          right: '4px',
          top: '4px',
          bottom: '4px',
          borderRadius: '8px',
          zIndex: 10,
          display: 'grid',
          placeItems: 'center',
          backgroundColor: 'rgba(212, 163, 115, 0.25)',
          color: '#d4a373',
          fontStyle: 'normal',
          transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="absolute right-1 top-1 bottom-1 rounded-sm z-10 grid w-1/4 place-items-center transition-all duration-500 bg-primary-foreground/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95"
      >
        <ChevronRight size={16} strokeWidth={2.5} aria-hidden="true" />
      </i>
    </Button>
  );
}
