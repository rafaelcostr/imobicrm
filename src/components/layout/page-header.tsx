interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className={actions ? "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" : undefined}>
      <div>
        <h1 id="page-title" className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </header>
  );
}
