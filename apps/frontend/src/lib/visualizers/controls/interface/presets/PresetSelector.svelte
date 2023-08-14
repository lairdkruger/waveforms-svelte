<script lang="ts">
	import DropdownIcon from '$lib/svgs/DropdownIcon.svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import type { PresetId } from '../../types/presets'

	const { controls } = getVisualizerContext()

	const presets = controls.presets.presets
	const currentPresetId = controls.presets.preset

	const handleChange = (event: Event) => {
		// Casts required
		const element = event.target as HTMLSelectElement
		const presetId = element.value as PresetId
		// Update controls state
		controls.changePreset(presetId)
	}
</script>

<div class="wrapper">
	<div class="selector">
		<div class="dropdown">
			<span class="cpHeading">{$presets[$currentPresetId].options.label}</span>
			<div class="dropdownIcon">
				<DropdownIcon />
			</div>
		</div>

		<select class="select" value={$presets[$currentPresetId].id} on:change={handleChange}>
			{#each Object.entries($presets) as [presetId, preset] (presetId)}
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
