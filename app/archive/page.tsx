import { Suspense } from "react";
import ClientArchive from "./client";

export default function ArchivePage() {
  return (
    <Suspense>
      <ClientArchive />
    </Suspense>
  );
}
