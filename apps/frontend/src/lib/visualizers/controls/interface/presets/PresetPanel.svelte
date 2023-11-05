<script lang="ts">
	import { page } from '$app/stores'
	import { handleCheckout } from '$lib/services/stripe'
	import MidiPresetButton from '../midi/MidiPresetButton.svelte'
	import PresetCreator from './PresetCreator.svelte'
	import PresetDeleter from './PresetDeleter.svelte'
	import PresetSaver from './PresetSaver.svelte'
	import PresetSelector from './PresetSelector.svelte'

	const subscribed = $page.data.subscribed
	const userId = $page.data.session?.user?.id

	const showSignUpButton = !userId
	const showCheckoutButton = userId && !subscribed
</script>

<div class="wrapper">
	<div class="presetSelector">
		<PresetSelector />
		<MidiPresetButton />
	</div>

	<div class="preset-creator" class:disabled={!subscribed}>
		<PresetCreator />
	</div>

	<div class="preset-savers" class:disabled={!subscribed}>
		<PresetSaver />
		<PresetDeleter />
	</div>

	<div class="ctas">
		{#if showCheckoutButton}
			<button on:click={() => handleCheckout()} disabled={subscribed}>
				Become A Supporter
			</button>
		{/if}

		{#if showSignUpButton}
			<a href="/enter"> Become A Supporter </a>
		{/if}
	</div>
</div>

<style>
	.wrapper {
		width: 174px;

		@media (max-width: 768px) {
			width: auto;
		}
	}

	.presetSelector {
		display: flex;
		flex-wrap: wrap;
		column-gap: var(--cpSpacing4);
		justify-content: space-between;
		margin-bottom: var(--cpSpacing16);
	}

	.preset-savers {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		flex-wrap: wrap;
		column-gap: var(--cpSpacing4);
		justify-content: space-between;

		@media (max-width: 768px) {
			display: none;
		}
	}

	.preset-creator {
		@media (max-width: 768px) {
			display: none;
		}
	}

	.disabled {
		opacity: 0.33;
		cursor: not-allowed;
		pointer-events: none;
	}

	.ctas {
		margin-top: var(--spacing16);
	}
</style>
