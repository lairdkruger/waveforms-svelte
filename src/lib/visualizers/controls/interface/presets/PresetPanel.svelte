<script lang="ts">
	// import MidiPresetButton from '../midi/MidiPresetButton.svelte'
	// import PresetCreator from './PresetCreator.svelte'
	// import PresetDeleter from './PresetDeleter.svelte'
	// import PresetSaver from './PresetSaver.svelte'
	import PresetSelector from './PresetSelector.svelte'
</script>

<div class="wrapper">
	<div class="presetSelector">
		<PresetSelector />
		<!-- <MidiPresetButton /> -->
	</div>

	<div class="preset-creator">
		<!-- <PresetCreator /> -->
	</div>

	<div class="preset-savers">
		<!-- <PresetSaver /> -->
		<!-- <PresetDeleter /> -->
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
</style>
