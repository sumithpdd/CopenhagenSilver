'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userInputSchema, type UserInputFormData } from '@/lib/validators';
import { usePhotoBoothStore } from '@/store/photo-booth';

export default function InputPage() {
  const router = useRouter();
  const initializeSession = usePhotoBoothStore(
    (state) => state.initializeSession
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserInputFormData>({
    resolver: zodResolver(userInputSchema),
  });

  const onSubmit = (data: UserInputFormData) => {
    // Initialize session in store
    initializeSession(data.userName, data.userEmail);

    // Navigate to camera screen
    router.push('/camera');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-4 px-4 border-b border-silver-400 border-opacity-20">
        <Link href="/" className="text-2xl font-bold silver-accent hover:text-silver-300 transition">
          ← Sitecore Silver
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="space-y-8 animate-fade-in">
            {/* Title */}
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-2 silver-accent">
                Welcome to Photo Booth
              </h2>
              <p className="text-silver-300">
                Let's create your Sitecore Silver memory
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 silver-bg p-6 rounded-lg"
            >
              {/* Name Input */}
              <div>
                <label
                  htmlFor="userName"
                  className="block text-sm font-medium mb-2 text-white"
                >
                  What's your name? *
                </label>
                <input
                  {...register('userName')}
                  id="userName"
                  type="text"
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-black border border-silver-400 rounded text-white placeholder-silver-300 focus:outline-none focus:ring-2 focus:ring-silver-400"
                  autoFocus
                />
                {errors.userName && (
                  <p className="mt-1 text-red-400 text-sm">
                    {errors.userName.message}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor="userEmail"
                  className="block text-sm font-medium mb-2 text-white"
                >
                  Email (optional)
                </label>
                <input
                  {...register('userEmail')}
                  id="userEmail"
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 bg-black border border-silver-400 rounded text-white placeholder-silver-300 focus:outline-none focus:ring-2 focus:ring-silver-400"
                />
                {errors.userEmail && (
                  <p className="mt-1 text-red-400 text-sm">
                    {errors.userEmail.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-silver-400 text-black font-bold rounded hover:bg-silver-500 disabled:opacity-50 transition-colors duration-200 text-lg"
              >
                {isSubmitting ? 'Getting Ready...' : 'Continue to Camera →'}
              </button>
            </form>

            {/* Info */}
            <div className="text-center text-sm text-silver-400">
              <p>Your photo will be created using AI magic</p>
              <p>and shared with our community gallery</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 border-t border-silver-400 border-opacity-20 text-center text-sm text-silver-400">
        <p>© 2026 Sitecore | 25 Years of Innovation</p>
      </footer>
    </div>
  );
}
