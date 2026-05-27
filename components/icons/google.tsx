import React from "react";
import { cn } from "@/lib/utils";

export const GoogleIcon = ({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    src="/images/icons/google.svg"
    alt="Google"
    className={cn("h-5 w-5", className)}
    {...props}
  />
);

export default GoogleIcon;
