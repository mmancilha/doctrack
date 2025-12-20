"use client";

import DocumentEditor from "../[id]/page";

export default function NewDocumentPage() {
  // Pass params as a plain object (not Promise) since this is a client component
  return <DocumentEditor params={{ id: "new" }} />;
}

