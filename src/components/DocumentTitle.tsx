import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { formatDocumentTitle, getPageTitleForPath } from "../lib/pageTitles";

/** Keeps the browser tab title in sync with the active route. */
export default function DocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = formatDocumentTitle(getPageTitleForPath(pathname));
  }, [pathname]);

  return null;
}
