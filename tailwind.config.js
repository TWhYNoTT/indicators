/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // DVRPC colors
        'dvrpc-teal': '#008485',
        'dvrpc-orange': '#d97706',
        'dvrpc-red': '#be123c',
        'dvrpc-blue': '#1d4ed8',
        'dvrpc-green': '#15803d',
        'dvrpc-purple': '#7e22ce',
      },
      spacing: {
        'chart-height': '400px',
        'chart-width': '100%',
      },
      boxShadow: {
        'tooltip': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'tooltip': '4px',
      },
      fontSize: {
        'chart-title': '1.25rem',
        'chart-label': '0.875rem',
        'chart-value': '0.75rem',
      },
      fontWeight: {
        'chart-title': '700',
        'chart-label': '600',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      transitionProperty: {
        'tooltip': 'opacity, transform',
      },
      transitionDuration: {
        '150': '150ms',
      },
    },
  },
  plugins: [],
  // This ensures Tailwind doesn't purge styles we need for the chart
  safelist: [
    'bg-teal-600',
    'bg-blue-600',
    'bg-orange-500',
    'bg-red-600',
    'bg-green-600',
    'text-teal-600',
    'text-blue-600',
    'text-orange-500',
    'text-red-600',
    'text-green-600',
    'border-teal-600',
    'border-blue-600',
    'border-orange-500',
    'border-red-600',
    'border-green-600',
  ]
};