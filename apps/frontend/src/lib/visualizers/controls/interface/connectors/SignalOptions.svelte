<script lang="ts">
	import EaseInIcon from '$lib/svgs/EaseInIcon.svelte'
	import EaseLinearIcon from '$lib/svgs/EaseLinearIcon.svelte'
	import EaseOutIcon from '$lib/svgs/EaseOutIcon.svelte'
	import OptionsIcon from '$lib/svgs/OptionsIcon.svelte'
	import OptionsLoopIcon from '$lib/svgs/OptionsLoopIcon.svelte'
	import OptionsPingPongIcon from '$lib/svgs/OptionsPingPongIcon.svelte'
	import OptionsStraightIcon from '$lib/svgs/OptionsStraightIcon.svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import { spring } from 'svelte/motion'

	export let controlId: string

	const { controls, audioAnalyzer, midi } = getVisualizerContext()
	const control = controls.getControl(controlId)
	const config = control.config
	$: signalConfig = $config.signal?.config
	const midiListening = midi.listening

	$: midiActive = $signalConfig?.booster?.context === 'midi'
	$: midiLabel = () => {
		if ($midiListening) {
			return 'Key?'
		} else if (midiActive) {
			// First four characters of midi function id, without the get_
			return $signalConfig?.booster?.id.slice(3, 7)
		} else {
			return 'MIDI'
		}
	}

	let expanded = false
	const opacity = spring(0)
	const width = spring(16)
	const height = spring(16)

	$: opacity.set(expanded ? 1 : 0)
	$: width.set(expanded ? 139 : 16)
	$: height.set(expanded ? 162 : 16)
</script>

<div class="signalOptions">
	<button class="icon" on:click={() => (expanded = !expanded)}>
		<OptionsIcon />
	</button>

	<div
		class="wrapper"
		style="
		width: {$width}px;
		height: {$height}px;
	"
	>
		<div
			class="content"
			style="
			opacity: {$opacity};
		"
		>
			<div class="group">
				<div class="label">
					<span class="cpLabel">Behaviour</span>
				</div>
				<div class="buttons">
					<button
						class="button"
						class:enabled={$signalConfig?.behaviour === 'straight'}
						on:click={() =>
							signalConfig?.update((config) => {
								config.behaviour = 'straight'
								return config
							})}
					>
						<OptionsStraightIcon />
					</button>
					<button
						class="button"
						class:enabled={$signalConfig?.behaviour === 'loop'}
						on:click={() =>
							signalConfig?.update((config) => {
								config.behaviour = 'loop'
								return config
							})}
					>
						<OptionsLoopIcon />
					</button>
					<button
						class="button"
						class:enabled={$signalConfig?.behaviour === 'pingpong'}
						on:click={() =>
							signalConfig?.update((config) => {
								config.behaviour = 'pingpong'
								return config
							})}
					>
						<OptionsPingPongIcon />
					</button>
				</div>
			</div>

			<div class="group">
				<div class="label">
					<span class="cpLabel">Shape</span>
				</div>
				<div class="buttons">
					<button
						class="button"
						class:enabled={$signalConfig?.ease === 'linear'}
						on:click={() =>
							signalConfig?.update((config) => {
								config.ease = 'linear'
								return config
							})}
					>
						<EaseLinearIcon />
					</button>
					<button
						class="button"
						class:enabled={$signalConfig?.ease === 'in'}
						on:click={() =>
							signalConfig?.update((config) => {
								config.ease = 'in'
								return config
							})}
					>
						<EaseInIcon />
					</button>
					<button
						class="button"
						class:enabled={$signalConfig?.ease === 'out'}
						on:click={() =>
							signalConfig?.update((config) => {
								config.ease = 'out'
								return config
							})}
					>
						<EaseOutIcon />
					</button>
				</div>
			</div>

			<div class="group">
				<div class="label">
					<span class="cpLabel">Boost</span>
				</div>
				<div class="buttons">
					<button
						class="button textLabel"
						class:enabled={$signalConfig?.booster?.id === 'getBassPeaked'}
						on:click={() =>
							signalConfig?.update((config) => {
								config.booster = audioAnalyzer.signals.getBassPeaked()
								return config
							})}
					>
						<span class="cpLabel">Bass</span>
					</button>
					<button
						class="button textLabel"
						class:enabled={$signalConfig?.booster?.id === 'getMidsPeaked'}
						on:click={() =>
							signalConfig?.update((config) => {
								config.booster = audioAnalyzer.signals.getMidsPeaked()
								return config
							})}
					>
						<span class="cpLabel">Mids</span>
					</button>
					<button
						class="button textLabel"
						class:enabled={$signalConfig?.booster?.id === 'getHighsPeaked'}
						on:click={() =>
							signalConfig?.update((config) => {
								config.booster = audioAnalyzer.signals.getHighsPeaked()
								return config
							})}
					>
						<span class="cpLabel">High</span>
					</button>
					<button
						class="button textLabel"
						class:enabled={$signalConfig?.booster?.id === 'getVolumePeaked'}
						on:click={() =>
							signalConfig?.update((config) => {
								config.booster = audioAnalyzer.signals.getVolumePeaked()
								return config
							})}
					>
						<span class="cpLabel">Volume</span>
					</button>
					<button
						class="button textLabel"
						class:enabled={!$signalConfig?.booster}
						on:click={() =>
							signalConfig?.update((config) => {
								config.booster = undefined
								return config
							})}
					>
						<span class="cpLabel">None</span>
					</button>
				</div>

				<div class="buttons">
					<button
						class="button textLabel"
						class:enabled={$signalConfig?.booster?.context === 'midi'}
						on:click={async () => {
							// Toggle midiListening off if already midiListening
							if ($midiListening) {
								midi.cancelListenForMidiInput()
								return
							}

							const midiSignalId = await midi.listenForMidiInput()
							if (!midiSignalId || !signalConfig) return null

							signalConfig.update((config) => {
								if (midi.signals[midiSignalId]) config.booster = midi.signals[midiSignalId]
								return config
							})
						}}
					>
						<span class="">{midiLabel()}</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.signalOptions {
		position: absolute;
		top: -8px;
		right: 16px;
		z-index: 10;

		min-height: 16px;
		min-width: 16px;

		background-color: white;

		border: 1px solid var(--black);
		border-radius: 9px;

		pointer-events: auto;
	}

	.icon {
		position: absolute;
		z-index: 1;
		top: 0;
		right: 0;

		width: 16px;
		height: 16px;

		display: flex;
		align-items: center;
		justify-content: center;
	}

	.wrapper {
		overflow: hidden;
	}

	.content {
		position: relative;
		top: 0;
		right: 0;

		width: 139px;

		display: flex;
		flex-direction: column;
		row-gap: 4px;
		align-items: flex-start;

		padding: 8px;
	}

	.group {
		display: flex;
		flex-direction: column;
		row-gap: 2px;
		align-items: flex-start;
	}

	.label {
		text-align: left;
	}

	.buttons {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		column-gap: 4px;
		row-gap: 4px;
	}

	.button {
		width: 16px;
		height: 16px;

		display: flex;
		align-items: center;
		justify-content: center;

		border: 1px solid black;
		border-radius: 2px;
	}

	.button.textLabel {
		width: auto;
		padding: 0 4px;
	}

	.button.enabled {
		background-color: var(--black);
		color: var(--white);
	}
</style>
