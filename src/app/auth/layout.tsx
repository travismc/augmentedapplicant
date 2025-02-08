export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <a href="/" className="text-2xl font-bold text-gray-900">
            FastJobHunter
          </a>
        </div>
        {children}
      </div>
    </div>
  );
}
