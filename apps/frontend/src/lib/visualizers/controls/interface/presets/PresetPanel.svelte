<script lang="ts">
	import PresetCreator from './PresetCreator.svelte'
	import PresetDeleter from './PresetDeleter.svelte'
	import PresetSaver from './PresetSaver.svelte'
	import PresetSelector from './PresetSelector.svelte'
</script>

<div class="wrapper">
	<div class="preset">
		<PresetSelector />
		<!-- <MidiPresetButton /> -->
	</div>
	<div class="align-end">
		<PresetSaver />
		<PresetDeleter />
	</div>
	<PresetCreator />
</div>

<style>
	.wrapper {
		width: 174px;
	}

	.preset {
		display: flex;
		flex-wrap: wrap;
		column-gap: var(--cpSpacing4);
		justify-content: space-between;
	}

	.align-end {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		flex-wrap: wrap;
		column-gap: var(--cpSpacing4);
		justify-content: space-between;
	}
</style>
