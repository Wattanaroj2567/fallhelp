/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                kanit: ['Kanit', 'sans-serif'],
            },
            colors: {
                primary: '#16AD78',
                secondary: '#3B82F6',
            }
        },
    },
    plugins: [],
}
