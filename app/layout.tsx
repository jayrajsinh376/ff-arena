import './globals.css';

export const metadata = {
  title: 'FF Arena - Free Fire Tournaments',
  description: 'India ka #1 Free Fire Tournament Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
