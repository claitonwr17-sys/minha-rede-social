import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-white text-black">
        {children}
      </body>
    </html>
  );
}

