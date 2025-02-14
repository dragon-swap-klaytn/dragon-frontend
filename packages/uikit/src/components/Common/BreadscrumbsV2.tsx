import { CaretRight } from "@phosphor-icons/react";
import NextLink from "next/link";

type BreadScrumbItem = {
  label: string;
  link?: string;
  isOutboundLink?: boolean;
};

type BreadcrumbsProps = {
  items: BreadScrumbItem[];
};

export function BreadscrumbsV2({ items }: BreadcrumbsProps) {
  return (
    <div className="text-[13px] inline">
      {items.map(({ label, link, isOutboundLink }, index) => (
        <div key={`breadcrumb-${label}`} className="inline">
          {!link ? (
            <span className="p-1">{label}</span>
          ) : isOutboundLink ? (
            <a className="p-1 hover:underline hover:opacity-70" href={link} target="_blank" rel="noreferrer">
              {label}
            </a>
          ) : (
            <NextLink href={link} className="p-1 hover:underline hover:opacity-70">
              {label}
            </NextLink>
          )}
          {index < items.length - 1 && <CaretRight size={16} className="inline mx-3 my-1.5" />}
        </div>
      ))}
    </div>
  );
}
