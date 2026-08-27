// Full-page auth layout — centered card over public/bg.jpg (sharp, no overlay).

type AuthShellProps = {
  children: React.ReactNode;
};

/**
 * Fills the viewport behind the overlay navbar so loading states never collapse the page.
 */
export function AuthShell({ children }: AuthShellProps) {
  return (
    <div
      className="flex min-h-dvh w-full flex-1 items-center justify-center bg-cover bg-center bg-no-repeat px-4 pb-8 pt-24 sm:pt-28"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="flex w-full max-w-md justify-center">{children}</div>
    </div>
  );
}
