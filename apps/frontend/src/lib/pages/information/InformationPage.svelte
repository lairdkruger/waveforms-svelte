<script lang="ts">
	import { page } from '$app/stores'
	import ContactForm from '$lib/forms/ContactForm.svelte'
	import GridLayout from '$lib/layouts/GridLayout.svelte'

	const user = $page.data.session?.user
	const subscribed = $page.data.subscribed

	let showCheckoutButton = user && !subscribed
	let showSignUpButton = !user

	function handleCheckout() {}
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
			the audio input in the visualizer control panel
			<br />
			<br />
			For direct output to input:<br />
			<a href="https://github.com/ExistentialAudio/BlackHole" target="_blank" rel="noreferrer">
				Blackhole
			</a>
			{` / `}
			<a href="https://jackaudio.org/" target="_blank" rel="noreferrer"> JACK </a>
		</p>
	</div>

	<div class="pricing">
		<h2>Pricing</h2>
		<p>All users have access to visualizers and control panels</p>
		<br />
		<p>
			To save custom visualizer settings as presets in your account - a WAVEFORMS Supporter Plan
			is required
		</p>
		<br />
		<p>
			WAVEFORMS Supporter Plan:
			<br />8 USD per month
		</p>
		<br />

		{#if showCheckoutButton}
			<button on:click={() => handleCheckout()} disabled={subscribed}>
				Become A Supporter
			</button>
		{/if}

		{#if showSignUpButton}
			<a href="/enter"> Create Account </a>
		{/if}
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
		<ContactForm />
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

	.pricing {
		grid-area: block-3;
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
