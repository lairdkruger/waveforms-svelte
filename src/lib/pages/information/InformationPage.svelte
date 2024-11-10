<script lang="ts">
	import GridLayout from '$lib/layouts/GridLayout.svelte'
</script>

<GridLayout>
	<div class="project">
		<h2>Project</h2>
		<p>WAVEFORMS is a growing collection of customisable real-time web audio visualizers</p>
		<br />
		<p>
			Check out my other work at
			<a href="https://www.lairdkruger.com" target="_blank" rel="noreferrer">lairdkruger.com</a>
		</p>
	</div>

	<div class="tech">
		<h2>Technologies</h2>
		<p>
			WAVEFORMS runs in any Chromium browser
			<br />
			<br />
			Device inputs (microphones) are used as default audio inputs
			<br />
			<br />
			To use Spotify, Youtube, Soundcloud etc: open them in another tab and then select BROWSER as
			the audio input from the bottom left of the visualizer control panel
			<br />
			<br />
			Recommended for direct device output to input:<br />
			<a href="https://github.com/ExistentialAudio/BlackHole" target="_blank" rel="noreferrer">
				Blackhole
			</a>
			{` / `}
			<a href="https://jackaudio.org/" target="_blank" rel="noreferrer"> JACK </a>
		</p>
	</div>

	<div class="legal">
		<h2>Legal</h2>
		<a href="/legal" target="_blank" rel="noopener noreferrer">
			<span>Privacy Policy</span>
		</a>
		<a href="/legal" target="_blank" rel="noopener noreferrer">
			<span>Terms of Use</span>
		</a>
	</div>

	<div class="contact">
		<h2>Contact</h2>
		<a href="mailto:hello@lairdkruger.com">Email Me</a>
	</div>
</GridLayout>

<style>
	div {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.project {
		grid-area: block-1;
	}

	.tech {
		grid-area: block-2;
	}

	.legal {
		grid-area: block-5;
	}

	.contact {
		grid-area: block-6;
	}

	@media (max-width: 768px) {
		div {
			margin-bottom: var(--sectionMargin);
		}
	}
</style>
