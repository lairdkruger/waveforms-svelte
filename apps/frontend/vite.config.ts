import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [sveltekit()],
	// Required for serving wasm files from outside of the frontend directory
	server: {
		fs: {
			strict: false
		}
	}
})
