import { createContext, useContext } from "react";

const BreadcrumbContext = createContext({ hideInline: false });

export function BreadcrumbSuppressInline({ children }) {
  return (
    <BreadcrumbContext.Provider value={{ hideInline: true }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbContext() {
  return useContext(BreadcrumbContext);
}
