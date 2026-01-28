import { cn } from "@/lib/utils"
import Image from "next/image"

interface ScriptureIconProps {
  className?: string
}

export function ScriptureIcon({ className }: ScriptureIconProps) {
  return (
    <Image
      src="/icon.svg"
      alt="Bible AI"
      width={20}
      height={20}
      className={cn("h-5 w-5 rounded", className)}
      aria-hidden="true"
    />
  )
}
