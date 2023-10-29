<script lang="ts">
	import { page } from '$app/stores'
	import { uiHidden } from '$lib/stores/UiStore'
	import WaveformsIcon from '$lib/svgs/WaveformsIcon.svelte'

	const user = $page.data.session?.user
</script>

<header class:hidden={$uiHidden}>
	<nav>
		<a class="logo" href="/">
			<div class="logoImage">
				<WaveformsIcon />
			</div>
		</a>

		<a class="visualizers" href="/"> Visualizers </a>
		<a class="information" href="/information"> Information </a>
		{#if user}
			<a class="account" href="/account"> Account </a>
		{:else}
			<a class="account" href="/enter"> Login / Register </a>
		{/if}
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
	}

	.logo {
		cursor: pointer;
		pointer-events: auto;
		grid-area: logo;
		position: relative;
		width: 80px;
		margin-right: auto;
	}

	.visualizers {
		grid-area: nav-1;
		margin-bottom: 0.5rem;
	}

	.information {
		grid-area: nav-2;
		margin-bottom: 0.5rem;
	}

	.account {
		grid-area: nav-3;
	}

	@media (max-width: 768px) {
		.logo {
			position: absolute;
			top: var(--margin);
			left: var(--margin);
		}

		.visualizers {
			margin-top: 3rem;
		}
	}
</style>
