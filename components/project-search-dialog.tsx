"use client"

import { usePathname } from "next/navigation"
import DefaultSearchDialog, {
  type DefaultSearchDialogProps,
} from "fumadocs-ui/components/dialog/search-default"

// Under /projects/<slug>, search only that project's docs (the API tags each
// page with its slug). The dialog reads defaultTag once on mount and stays
// mounted across navigations, so it is keyed on the slug to start fresh.
export const ProjectSearchDialog = (props: DefaultSearchDialogProps) => {
  const slug = usePathname().match(/^\/projects\/([^/]+)/)?.[1]
  return <DefaultSearchDialog key={slug ?? ""} {...props} defaultTag={slug} />
}
