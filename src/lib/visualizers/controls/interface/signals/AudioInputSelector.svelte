<script lang="ts">
	import DropdownIcon from '$lib/svgs/DropdownIcon.svelte'
	import type { AudioInput } from '$lib/visualizers/audio/AudioAnalyzer.svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'

	const visualizerContext = getVisualizerContext()
	let value: AudioInput

	const handleChange = () => {
		// Update audio context
		visualizerContext.audioAnalyzer.changeAudioInput(value)
	}
</script>

<div class="audioSelectForm">
	<label class="cpLabel" for="audioSelect">Audio Input:</label>

	<div class="selector">
		<div class="dropdown">
			<span class="cpHeading">{value}</span>
			<div class="dropdownIcon">
				<DropdownIcon />
			</div>
		</div>

		<select id="audioSelect" class="select" bind:value on:change={handleChange}>
			<option value="microphone">Microphone</option>
			<option value="browser">Browser</option>
		</select>
	</div>
</div>

<style>
	.audioSelectForm {
		display: flex;
		align-items: center;
		justify-content: space-between;
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

	.dropdownIcon {
		margin-left: var(--cpSpacing4);
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
</style>
