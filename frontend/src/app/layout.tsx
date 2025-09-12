import './src/styles/globals.css';

export const metadata = {
  title: 'VibeCaaS Platform',
  description: 'Cloud application deployment and hosting platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}