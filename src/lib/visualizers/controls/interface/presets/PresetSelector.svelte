<script lang="ts">
	import { browser } from '$app/environment'
	import DropdownIcon from '$lib/svgs/DropdownIcon.svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import type { PresetId } from '../../types/presets'
	import { onMount } from 'svelte'

	let visualizerContext = getVisualizerContext()

	let handleChange = (event: Event) => {
		// Casts required
		let element = event.target as HTMLSelectElement
		let presetId = element.value as PresetId
		// Update controls state
		visualizerContext.controls.changePreset(presetId)
	}

	// Listen for midi events as these can also be used to select presets
	onMount(() => {
		if (!browser) return

		window.addEventListener('midiMessage', (event: Event) => {
			// @ts-ignore
			let { midiSignalId, value } = event.detail
			if (value !== 1) return

			// Search the presets objects for a preset that has a midi binding currently matching the midiControlId
			// If so, change to that preset
			for (let [presetId, preset] of Object.entries(
				visualizerContext.controls.presets.presets
			)) {
				if (preset.midiBinding === midiSignalId) {
					visualizerContext.controls.changePreset(presetId)
				}
			}
		})
	})
</script>

<div class="wrapper">
	<div class="selector">
		<div class="dropdown">
			<span class="cpHeading"
				>{visualizerContext.controls.presets.presets[visualizerContext.controls.presets.preset]
					.options.label}</span
			>
			<div class="dropdownIcon">
				<DropdownIcon />
			</div>
		</div>

		<select
			class="select"
			value={visualizerContext.controls.presets.presets[
				visualizerContext.controls.presets.preset
			].id}
			onchange={handleChange}
		>
			{#each Object.entries(visualizerContext.controls.presets.presets) as [presetId, preset] (presetId)}
				<option value={preset.id}>
					{preset.options?.label}
				</option>
			{/each}
		</select>
	</div>
</div>

<style>
	.wrapper {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--cpSpacing8);

		@media (max-width: 768px) {
			margin-bottom: 0;
		}
	}

	.selector {
		position: relative;

		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.dropdown {
		position: relative;

		display: flex;
		align-items: center;
	}

	.select {
		position: absolute;
		top: 0;
		left: 0;

		width: 100%;
		height: 100%;

		opacity: 0;

		cursor: pointer;
	}

	.dropdownIcon {
		margin-left: var(--cpSpacing4);
		display: flex;
	}
</style>
