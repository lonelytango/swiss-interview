import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(() => {
  // GitHub Pages serves the site from `/<repo>/`, so Vite must be built with that base.
  // In Actions we set BASE_PATH="/<repo>/".
  const base =
    process.env.BASE_PATH ??
    (process.env.GITHUB_REPOSITORY
      ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
      : '/')

  return {
    base,
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
    },
  }
})
