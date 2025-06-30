"use client"
 
import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import { X } from "lucide-react"
import { AnimatePresence, MotionConfig, motion } from "framer-motion"
 
import { cn } from "@/lib/utils"
 
const TRANSITION = {
  type: "spring",
  bounce: 0.05,
  duration: 0.3,
}
 
function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: () => void
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    }
 
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [ref, handler])
}
 
interface PopoverContextType {
  isOpen: boolean
  openPopover: () => void
  closePopover: () => void
  uniqueId: string
  value: string
  setValue: (value: string) => void
}
 
const PopoverContext = createContext<PopoverContextType | undefined>(undefined)
 
export function usePopover() {
  const context = useContext(PopoverContext)
  if (!context) {
    throw new Error("usePopover must be used within a PopoverProvider")
  }
  return context
}
 
function usePopoverLogic(initialValue: string = "") {
  const uniqueId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState(initialValue)
 
  const openPopover = () => {
    setValue(initialValue) 
    setIsOpen(true)
  }
  const closePopover = () => {
    setIsOpen(false)
  }
 
  return { isOpen, openPopover, closePopover, uniqueId, value, setValue }
}
 
interface PopoverRootProps {
  children: React.ReactNode
  className?: string
  initialValue?: string
}
 
export function PopoverRoot({ children, className, initialValue = "" }: PopoverRootProps) {
  const popoverLogic = usePopoverLogic(initialValue)
 
  return (
    <PopoverContext.Provider value={popoverLogic}>
      <MotionConfig transition={TRANSITION}>
        <div
          className={cn(
            "relative flex items-center justify-center isolate",
            className
          )}
        >
          {children}
        </div>
      </MotionConfig>
    </PopoverContext.Provider>
  )
}
 
interface PopoverTriggerProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}
 
export function PopoverTrigger({ children, className, asChild = false }: PopoverTriggerProps) {
  const { openPopover, uniqueId } = usePopover()
  const Comp = asChild ? motion.div : motion.button;
 
  return (
    <Comp
      key="button"
      layoutId={`popover-${uniqueId}`}
      className={cn(
        !asChild && "flex h-9 items-center border border-zinc-950/10 bg-white px-3 text-zinc-950 dark:border-zinc-50/10 dark:bg-zinc-700 dark:text-zinc-50",
        className
      )}
      style={{
        borderRadius: 8,
      }}
      onClick={(e) => {
        e.stopPropagation();
        openPopover()
      }}
    >
      <motion.span layoutId={`popover-label-${uniqueId}`} className="text-sm">
        {children}
      </motion.span>
    </Comp>
  )
}
 
interface PopoverContentProps {
  children: React.ReactNode
  className?: string
}
 
export function PopoverContent({ children, className }: PopoverContentProps) {
  const { isOpen, closePopover, uniqueId } = usePopover()
  const formContainerRef = useRef<HTMLDivElement>(null)
 
  useClickOutside(formContainerRef, closePopover)
 
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePopover()
      }
    }
 
    document.addEventListener("keydown", handleKeyDown)
 
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [closePopover])
 
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={formContainerRef}
          layoutId={`popover-${uniqueId}`}
          className={cn(
            "absolute h-[200px] w-[364px] overflow-hidden border border-border bg-card outline-none z-50",
            className
          )}
          style={{
            borderRadius: 12,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
 
interface PopoverFormProps {
  children: React.ReactNode
  onSubmit?: (value: string) => void
  className?: string
}
 
export function PopoverForm({
  children,
  onSubmit,
  className,
}: PopoverFormProps) {
  const { value, closePopover } = usePopover()
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(value)
    closePopover()
  }
 
  return (
    <form
      className={cn("flex h-full flex-col", className)}
      onSubmit={handleSubmit}
    >
      {children}
    </form>
  )
}
 
interface PopoverLabelProps {
  children: React.ReactNode
  className?: string
}
 
export function PopoverLabel({ children, className }: PopoverLabelProps) {
  const { uniqueId, value } = usePopover()
 
  return (
    <motion.span
      layoutId={`popover-label-${uniqueId}`}
      aria-hidden="true"
      style={{
        opacity: value ? 0 : 1,
      }}
      className={cn(
        "absolute left-4 top-3 select-none text-sm text-muted-foreground",
        className
      )}
    >
      {children}
    </motion.span>
  )
}
 
interface PopoverInputProps {
  className?: string;
  placeholder?: string;
}
 
export function PopoverInput({ className, placeholder }: PopoverInputProps) {
  const { value, setValue } = usePopover()
 
  return (
    <input
      placeholder={placeholder}
      className={cn(
        "h-full w-full resize-none rounded-md bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground",
        className
      )}
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}
 
interface PopoverFooterProps {
  children: React.ReactNode
  className?: string
}
 
export function PopoverFooter({ children, className }: PopoverFooterProps) {
  return (
    <div
      key="close"
      className={cn("flex justify-between items-center bg-background/50 p-2 border-t", className)}
    >
      {children}
    </div>
  )
}
 
interface PopoverCloseButtonProps {
  className?: string
  children?: React.ReactNode
}
 
export function PopoverCloseButton({ className, children }: PopoverCloseButtonProps) {
  const { closePopover } = usePopover()
 
  return (
    <button
      type="button"
      className={cn("flex items-center p-2 rounded-md hover:bg-muted", className)}
      onClick={closePopover}
      aria-label="Close popover"
    >
      {children || <X size={16} className="text-muted-foreground" />}
    </button>
  )
}
 
interface PopoverSubmitButtonProps {
  className?: string
  children?: React.ReactNode
}
 
export function PopoverSubmitButton({ className, children }: PopoverSubmitButtonProps) {
  return (
    <button
      className={cn(
        "relative ml-1 flex h-8 shrink-0 scale-100 select-none appearance-none items-center justify-center rounded-lg border border-transparent bg-primary px-3 text-sm text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 active:scale-[0.98]",
        className
      )}
      type="submit"
      aria-label="Submit"
    >
      {children || "Submit"}
    </button>
  )
}
 
export function PopoverHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "p-4 pb-2 font-semibold text-foreground",
        className
      )}
    >
      {children}
    </div>
  )
}
 
export function PopoverBody({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("p-4 pt-0 text-sm text-muted-foreground flex-1", className)}>{children}</div>
}
