import { useState, useEffect } from "react";

export function useIsDesktop(minWidth = 1024) {
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  useEffect(() => {
    const checkSize = () => {
      setIsDesktop(window.innerWidth >= minWidth);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, [minWidth]);

  return isDesktop;
}