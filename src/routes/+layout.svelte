<script lang="ts">
	import '$lib/styles/base.css'
	import '$lib/styles/colors.css'
	import '$lib/styles/controls.css'
	import '$lib/styles/motion.css'
	import '$lib/styles/spacing.css'
	import '$lib/styles/typography.css'

	import Header from '$lib/components/Header.svelte'
	import Footer from '$lib/components/Footer.svelte'
	import type { Snippet } from 'svelte'
	import { createUiContext } from '$lib/contexts/ui.svelte'

	interface Props {
		children: Snippet
	}

	let { children }: Props = $props()

	createUiContext()
</script>

<svelte:head>
	<title>WAVEFORMS</title>
	<meta
		name="description"
		content="Web-based realtime audio visualizers. Control and customise visuals for Spotify, Soundcloud and other audio sources in real-time."
	/>
	<meta name="creator" content="Laird Kruger" />
</svelte:head>

<Header />
{@render children()}
<Footer />
