export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md">{children}</div>
    </main>
  );
}
