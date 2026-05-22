import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "premium";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 active:scale-98 cursor-pointer";
    
    const variants = {
      default: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/25",
      secondary: "bg-white/10 text-white hover:bg-white/15 border border-white/5",
      destructive: "bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/25",
      outline: "border border-white/15 bg-transparent hover:bg-white/5 text-white",
      ghost: "hover:bg-white/5 text-slate-300 hover:text-white",
      premium: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white shadow-lg shadow-purple-500/20 font-semibold tracking-wide",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 py-1.5 text-xs",
      lg: "h-12 px-6 py-3 text-base",
      icon: "h-10 w-10",
    };

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ""}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
