<script lang="ts">
	import WaveformsIcon from '$lib/svgs/WaveformsIcon.svelte'

	let user = false
	const currentYear = new Date().getFullYear()
</script>

<header>
	<nav class="navigation">
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
		<h1 class="copyright">{`Waveforms © ${currentYear} : VER.BETA.1.0`}</h1>
	</nav>
</header>

<style>
	.navigation {
		display: grid;
		grid-template-columns: repeat(12, var(--column));
		grid-template-areas: 'logo . . . . . nav-1 nav-1 nav-2 nav-2 nav-3 nav-3';
		justify-items: end;
		align-items: start;

		color: var(--white);
		mix-blend-mode: var(--mixBlendMode);
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

	.copyright {
		position: absolute;
		bottom: var(--margin);
		left: var(--margin);
	}

	@media screen and (max-width: 768px) {
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
