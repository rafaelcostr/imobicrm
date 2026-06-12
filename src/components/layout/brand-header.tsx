import { Building2 } from "lucide-react";

interface BrandHeaderProps {
  title: string;
  description?: string;
  headingId?: string;
}

export function BrandHeader({ title, description, headingId }: BrandHeaderProps) {
  return (
    <header className="text-center">
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"
        aria-hidden="true"
      >
        <Building2 className="h-6 w-6" />
      </div>
      <h1
        id={headingId}
        className="text-2xl font-semibold leading-none tracking-tight"
      >
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
    </header>
  );
}
