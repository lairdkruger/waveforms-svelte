<script lang="ts">
	const currentYear = new Date().getFullYear()
</script>

<footer>
	<span class="copyright">{`Waveforms © ${currentYear} : VER.BETA.1.0`}</span>
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
	}

	.copyright {
		text-transform: uppercase;
	}
</style>
