import type { FC, ReactNode, Ref } from "react";
import { isValidElement } from "react";
import { cx, sortCx } from "@/utils/cx";
import { isReactComponent } from "@/utils/is-react-component";

const iconsSizes = {
    sm: "*:data-icon:size-4 *:data-icon:stroke-[2.25px]",
    md: "*:data-icon:size-5",
    lg: "*:data-icon:size-6",
    xl: "*:data-icon:size-7",
};

const styles = sortCx({
    light: {
        base: "rounded-sm",
        sizes: {
            sm: "size-8",
            md: "size-10",
            lg: "size-12",
            xl: "size-14",
        },
        colors: {
            brand: "bg-brand-secondary/60 text-featured-icon-light-fg-brand",
            gray: "bg-tertiary/60 text-featured-icon-light-fg-gray",
            error: "bg-error-secondary/60 text-featured-icon-light-fg-error",
            warning: "bg-warning-secondary/60 text-featured-icon-light-fg-warning",
            success: "bg-success-secondary/60 text-featured-icon-light-fg-success",
        },
    },

    gradient: {
        base: "rounded-sm text-fg-white before:absolute before:inset-0 before:size-full before:rounded-sm before:border before:mask-b-from-0% after:absolute after:block after:rounded-sm",
        sizes: {
            sm: "size-8 after:size-6 *:data-icon:size-4",
            md: "size-10 after:size-7 *:data-icon:size-4",
            lg: "size-12 after:size-8 *:data-icon:size-5",
            xl: "size-14 after:size-10 *:data-icon:size-5",
        },
        colors: {
            brand: "before:border-utility-brand-200/60 before:bg-utility-brand-50/60 after:bg-brand-solid",
            gray: "before:border-utility-neutral-200/60 before:bg-utility-neutral-50/60 after:bg-secondary-solid",
            error: "before:border-utility-red-200/60 before:bg-utility-red-50/60 after:bg-error-solid",
            warning: "before:border-utility-yellow-200/60 before:bg-utility-yellow-50/60 after:bg-warning-solid",
            success: "before:border-utility-green-200/60 before:bg-utility-green-50/60 after:bg-success-solid",
        },
    },

    dark: {
        base: "text-fg-white before:absolute before:inset-px before:border before:border-white/12 before:mask-b-from-0%",
        sizes: {
            sm: "size-8 rounded-sm before:rounded-[3px]",
            md: "size-10 rounded-sm before:rounded-[3px]",
            lg: "size-12 rounded-sm before:rounded-[3px]",
            xl: "size-14 rounded-sm before:rounded-[3px]",
        },
        colors: {
            brand: "bg-brand-solid before:border-utility-brand-200/12",
            gray: "bg-secondary-solid before:border-utility-neutral-200/12",
            error: "bg-error-solid before:border-utility-red-200/12",
            warning: "bg-warning-solid before:border-utility-yellow-200/12",
            success: "bg-success-solid before:border-utility-green-200/12",
        },
    },

    modern: {
        base: "bg-primary ring-1 ring-primary ring-inset",
        sizes: {
            sm: "size-8 rounded-sm",
            md: "size-10 rounded-sm",
            lg: "size-12 rounded-sm",
            xl: "size-14 rounded-sm",
        },
        colors: {
            brand: "text-fg-brand-primary",
            gray: "text-fg-secondary",
            error: "text-fg-error-primary",
            warning: "text-fg-warning-primary",
            success: "text-fg-success-primary",
        },
    },
    "modern-neue": {
        base: "bg-primary_alt ring-1 ring-inset before:absolute before:inset-1 before:shadow-sm before:ring-1 before:ring-secondary_alt",
        sizes: {
            sm: "size-8 rounded-sm before:rounded-[2px]",
            md: "size-10 rounded-sm before:rounded-[2px]",
            lg: "size-12 rounded-sm before:rounded-[2px]",
            xl: "size-14 rounded-sm before:rounded-[2px]",
        },
        colors: {
            brand: "",
            gray: "text-fg-secondary ring-primary",
            error: "",
            warning: "",
            success: "",
        },
    },

    outline: {
        base: "before:absolute before:rounded-sm before:border-2 after:absolute after:rounded-sm after:border-2",
        sizes: {
            sm: "size-4 before:size-6 after:size-8.5",
            md: "size-5 before:size-7 after:size-9.5",
            lg: "size-6 before:size-8 after:size-10.5",
            xl: "size-7 before:size-9 after:size-11.5",
        },
        colors: {
            brand: "text-fg-brand-primary before:border-fg-brand-primary/30 after:border-fg-brand-primary/10",
            gray: "text-fg-tertiary before:border-fg-tertiary/30 after:border-fg-tertiary/10",
            error: "text-fg-error-primary before:border-fg-error-primary/30 after:border-fg-error-primary/10",
            warning: "text-fg-warning-primary before:border-fg-warning-primary/30 after:border-fg-warning-primary/10",
            success: "text-fg-success-primary before:border-fg-success-primary/30 after:border-fg-success-primary/10",
        },
    },
});

interface FeaturedIconProps {
    ref?: Ref<HTMLDivElement>;
    children?: ReactNode;
    className?: string;
    icon?: FC<{ className?: string }> | ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    color: "brand" | "gray" | "success" | "warning" | "error";
    theme?: "light" | "gradient" | "dark" | "outline" | "modern" | "modern-neue";
}

export const FeaturedIcon = (props: FeaturedIconProps) => {
    const { size = "sm", theme: variant = "light", color = "brand", icon: Icon, ...otherProps } = props;

    return (
        <div
            {...otherProps}
            data-featured-icon
            className={cx(
                "relative flex shrink-0 items-center justify-center",

                iconsSizes[size],
                styles[variant].base,
                styles[variant].sizes[size],
                styles[variant].colors[color],

                props.className,
            )}
        >
            {isReactComponent(Icon) && <Icon data-icon className="z-1" />}
            {isValidElement(Icon) && <div className="z-1">{Icon}</div>}

            {props.children}
        </div>
    );
};
