import { useMatches } from "@tanstack/react-router";
import { Fragment, useMemo } from "react";
import { match, P } from "ts-pattern";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/ui/breadcrumb.tsx";

export function AppBreadcrumbs() {
  const matches = useMatches();
  const crumbs = useMemo(() => {
    return matches.flatMap((routeMatch) => {
      const crumb = match(routeMatch.staticData)
        .with({ crumb: P.string }, ({ crumb }) => crumb)
        .otherwise(() => undefined);

      return crumb
        ? {
            id: routeMatch.id,
            displayText: crumb,
          }
        : [];
    });
  }, [matches]);

  return (
    <Breadcrumb>
      <BreadcrumbList className="font-mono text-xs">
        {crumbs.map((crumb, i) => (
          <Fragment key={crumb.id}>
            {i > 0 && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
            <BreadcrumbItem>
              {i === crumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.displayText}</BreadcrumbPage>
              ) : (
                <span>{crumb.displayText}</span>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
