import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
    icon?: LucideIcon;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", icon: Icon, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-white text-black hover:bg-white/90": variant === "primary",
                        "bg-gray-500/70 text-white hover:bg-gray-500/50": variant === "secondary",
                        "hover:bg-white/10 text-white": variant === "ghost",
                        "h-8 px-3 text-sm": size === "sm",
                        "h-10 px-4 py-2": size === "md",
                        "h-12 px-6 text-lg": size === "lg",
                    },
                    className
                )}
                {...props}
            >
                {Icon && <Icon className="mr-2 h-5 w-5" />}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export { Button };
