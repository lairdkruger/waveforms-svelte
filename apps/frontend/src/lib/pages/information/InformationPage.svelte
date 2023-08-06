<script lang="ts">
	import ContactForm from '$lib/forms/ContactForm.svelte'
	import GridLayout from '$lib/layouts/GridLayout.svelte'
	import type { ActionData } from '../../../routes/$types'

	export let contactFormData: ActionData

	let showCheckoutButton = false
	let showSignUpButton = false
	let subscribed = false

	function handleCheckout() {}
</script>

<GridLayout>
	<div class="project">
		<h2>Project</h2>
		<p>WAVEFORMS is a collection of customisable real-time web audio visualizers</p>
		<p>
			It is the hobby project of{` `}
			<a href="https://www.lairdkruger.com" target="_blank" rel="noreferrer"> Laird Kruger </a>
		</p>
	</div>

	<div class="tech">
		<h2>Technologies</h2>
		<p>
			Any Chromium browser
			<br />
			Audio input source
			<br />
			<br />
			Also Recommended: <br />
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
		<p>
			To save your custom visualizer settings as presets in your account - a WAVEFORMS Supporter
			Plan is required
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
		<ContactForm formData={contactFormData} />
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
