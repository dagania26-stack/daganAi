import { type RefObject, useEffect } from "react";

export function useScrollToBottom(
  ref: RefObject<HTMLDivElement | null>,
  deps: React.DependencyList,
): void {
  useEffect(() => {
    const id = setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
