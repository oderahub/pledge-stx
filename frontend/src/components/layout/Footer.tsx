export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900/50 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-bold text-white">StacksPledge</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 StacksPledge. Built on Stacks. Secured by Bitcoin.
          </p>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-purple-600/20 rounded-full text-purple-300 text-xs">
              Clarity 4
            </span>
            <span className="px-3 py-1 bg-orange-600/20 rounded-full text-orange-300 text-xs">
              Stacks Builder Challenge
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
