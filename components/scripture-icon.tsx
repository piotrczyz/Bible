import { cn } from "@/lib/utils"

interface ScriptureIconProps {
  className?: string
}

export function ScriptureIcon({ className }: ScriptureIconProps) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      {/* Open book - left page */}
      <path
        d="M260 300 Q260 260 300 250 H480 Q512 260 512 300 V700 Q512 720 480 720 H320 Q260 720 260 680 Z"
        fill="currentColor"
      />
      {/* Open book - right page */}
      <path
        d="M764 300 Q764 260 724 250 H544 Q512 260 512 300 V700 Q512 720 544 720 H704 Q764 720 764 680 Z"
        fill="currentColor"
      />
      {/* Bottom book curve */}
      <path
        d="M320 720 Q512 780 704 720 L704 760 Q512 820 320 760 Z"
        fill="currentColor"
      />
      {/* Cross - vertical */}
      <rect
        x="482"
        y="360"
        width="60"
        height="280"
        rx="30"
        className="fill-background"
      />
      {/* Cross - horizontal */}
      <rect
        x="420"
        y="450"
        width="184"
        height="60"
        rx="30"
        className="fill-background"
      />
    </svg>
  )
}
