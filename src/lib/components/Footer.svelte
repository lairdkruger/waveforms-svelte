<script lang="ts">
	import { getUiContext } from '$lib/contexts/ui.svelte'

	const uiContext = getUiContext()
	const currentYear = new Date().getFullYear()
</script>

<footer class:hidden={uiContext.uiHidden}>
	<span class="copyright">{`Waveforms © ${currentYear} : VERSION:BETA.1.1`}</span>
</footer>

<style>
	footer {
		position: fixed;
		z-index: 2;
		bottom: 0;
		left: 0;

		width: 100%;
		padding: var(--spacing16) var(--margin);

		color: var(--white);
		mix-blend-mode: var(--mixBlendMode);

		visibility: visible;
	}

	.hidden {
		visibility: hidden;
	}

	.copyright {
		text-transform: uppercase;
	}
</style>
