<script lang="ts">
	import { getUiContext } from '$lib/contexts/ui.svelte'
	import WaveformsIcon from '$lib/svgs/WaveformsIcon.svelte'

	const uiContext = getUiContext()
</script>

<header class:hidden={uiContext.uiHidden}>
	<nav>
		<a class="logo" href="/">
			<div class="logoImage">
				<WaveformsIcon />
			</div>
		</a>

		<a class="information" href="/information"> Information </a>
	</nav>
</header>

<style>
	header {
		position: fixed;
		z-index: 2;
		top: 0;
		left: 0;
		width: 100%;

		color: var(--white);
		mix-blend-mode: var(--mixBlendMode);

		visibility: visible;
	}

	.hidden {
		visibility: hidden;
	}

	nav {
		width: 100%;
		padding: var(--spacing16) var(--margin);

		display: grid;
		grid-template-columns: repeat(12, var(--column));
		grid-template-areas: 'logo . . . . . nav-1 nav-1 nav-2 nav-2 nav-3 nav-3';
		justify-items: end;
		align-items: start;

		@media (max-width: 768px) {
			position: fixed;
			top: 0;
			right: 0;

			display: flex;
			flex-direction: column;

			align-items: flex-end;
		}
	}

	.logo {
		cursor: pointer;
		pointer-events: auto;
		grid-area: logo;
		position: relative;
		width: 80px;
		margin-right: auto;
	}

	.information {
		grid-area: nav-3;
		margin-bottom: 0.5rem;
	}

	@media (max-width: 768px) {
		.logo {
			position: absolute;
			top: var(--margin);
			left: var(--margin);
		}
	}
</style>
