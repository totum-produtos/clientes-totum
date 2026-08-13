"use client";

import React from "react";
import { sendBioTrackBeacon } from "./track-client";

interface TrackedLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  slug: string;
  targetType: "link" | "product";
  targetId: string;
}

export function TrackedLink({ slug, targetType, targetId, onClick, children, ...rest }: TrackedLinkProps) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    sendBioTrackBeacon({ slug, target_type: targetType, target_id: targetId });
    onClick?.(e);
  }

  return (
    <a {...rest} onClick={handleClick}>
      {children}
    </a>
  );
}
