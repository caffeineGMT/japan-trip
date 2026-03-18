import { useTranslations } from 'next-intl';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-50 to-white dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-2xl text-center">
        {/* Offline Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          You're Offline
        </h1>

        {/* Description */}
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          No internet connection detected. But don't worry - we've got you covered!
        </p>

        {/* Available Features */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            What You Can Still Do:
          </h2>

          <div className="space-y-4 text-left">
            {[
              {
                icon: '🗾',
                title: 'Browse Cached Maps',
                description: 'View previously loaded map tiles and saved places',
              },
              {
                icon: '💬',
                title: 'Access Phrase Book',
                description: 'All essential Japanese phrases are available offline',
              },
              {
                icon: '🌸',
                title: 'Check Sakura Forecast',
                description: 'Last updated cherry blossom bloom predictions',
              },
              {
                icon: '✅',
                title: 'View Your Checklist',
                description: 'Track your saved items and trip plans',
              },
              {
                icon: '📱',
                title: 'Browse Cached Pages',
                description: 'Previously visited pages are stored for offline access',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="text-3xl flex-shrink-0">{feature.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retry Button */}
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Try Again
        </button>

        {/* Tips */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            💡 Pro Tip
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            For the best offline experience, browse the pages you'll need while connected to the internet.
            They'll be automatically cached for offline access later.
          </p>
        </div>

        {/* Connection Status */}
        <div className="mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-400">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span>Waiting for connection...</span>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8">
          <a
            href="/"
            className="text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 font-medium"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
