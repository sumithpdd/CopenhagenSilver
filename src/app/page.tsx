'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex-1 flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="photo-booth-hero flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl space-y-12 animate-fade-in">
          {/* Logo & Branding */}
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-silver-400 to-silver-600 rounded-full blur-2xl opacity-30 scale-110"></div>
                <Image
                  src="/logo.jpg"
                  alt="Sitecore Silver"
                  width={140}
                  height={140}
                  className="relative rounded-full border-4 border-silver-400 shadow-2xl"
                  priority
                />
              </div>
            </div>

            {/* Main Title */}
            <div>
              <h1 className="text-6xl md:text-8xl font-bold mb-2 tracking-tight">
                <span className="bg-gradient-to-r from-silver-300 via-silver-400 to-silver-300 bg-clip-text text-transparent">
                  Sitecore
                </span>
              </h1>
              <h2 className="text-4xl md:text-6xl font-bold text-silver-400 mb-4">
                Silver
              </h2>
            </div>

            {/* Tagline */}
            <div className="space-y-2">
              <p className="text-2xl md:text-3xl font-light text-silver-300">
                25 Years of Innovation
              </p>
              <p className="text-lg md:text-xl text-silver-400">
                Celebrating heritage, community, and the future
              </p>
              <p className="text-base text-silver-500 mt-4">
                Tivoli, Copenhagen • June 11, 2026
              </p>
            </div>
          </div>

          {/* Main Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto w-full">
            {/* Create New Photo */}
            <Link
              href="/input"
              className="group relative overflow-hidden rounded-xl p-8 bg-gradient-to-br from-silver-500 to-silver-600 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4">📸</div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Photo</h2>
                <p className="text-sm text-slate-800 opacity-90">
                  Capture your moment through AI's creative lens
                </p>
              </div>
            </Link>

            {/* View Gallery */}
            <Link
              href="/gallery"
              className="group relative overflow-hidden rounded-xl p-8 bg-gradient-to-br from-silver-600 to-silver-700 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative z-10">
                <div className="text-5xl mb-4">🖼️</div>
                <h2 className="text-2xl font-bold text-white mb-2">View Gallery</h2>
                <p className="text-sm text-silver-100 opacity-90">
                  Discover creations from the community
                </p>
              </div>
            </Link>
          </div>

          {/* Event Details */}
          <div className="border-t border-silver-500 border-opacity-30 pt-8 text-center space-y-4">
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-sm">
              <div>
                <p className="text-silver-400 text-xs uppercase tracking-wider">Location</p>
                <p className="text-silver-200 font-semibold">Tivoli</p>
              </div>
              <div>
                <p className="text-silver-400 text-xs uppercase tracking-wider">Date</p>
                <p className="text-silver-200 font-semibold">June 11</p>
              </div>
              <div>
                <p className="text-silver-400 text-xs uppercase tracking-wider">Year</p>
                <p className="text-silver-200 font-semibold">2026</p>
              </div>
            </div>

            <p className="text-xs text-silver-500 uppercase tracking-widest pt-4">
              Powered by Google Gemini AI • Secured by Firebase
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-silver-600 border-opacity-20 py-6 px-4 text-center text-sm text-silver-500">
        <p>© 2026 Sitecore • 25 Years of Digital Excellence</p>
      </footer>
    </main>
  );
}
