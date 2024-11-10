<script lang="ts">
	import EaseInIcon from '$lib/svgs/EaseInIcon.svelte'
	import EaseLinearIcon from '$lib/svgs/EaseLinearIcon.svelte'
	import EaseOutIcon from '$lib/svgs/EaseOutIcon.svelte'
	import OptionsIcon from '$lib/svgs/OptionsIcon.svelte'
	import OptionsLoopIcon from '$lib/svgs/OptionsLoopIcon.svelte'
	import OptionsPingPongIcon from '$lib/svgs/OptionsPingPongIcon.svelte'
	import OptionsStraightIcon from '$lib/svgs/OptionsStraightIcon.svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import { spring } from 'svelte/motion'

	interface Props {
		controlId: string
	}

	let { controlId }: Props = $props()

	let visualizerContext = getVisualizerContext()
	let control = visualizerContext.controls.getControl(controlId)

	let midiActive = $derived(control.config.signal?.config?.booster?.context === 'midi')
	let midiLabel = $derived.by(() => {
		if (visualizerContext.midi.listening) {
			return 'Key?'
		} else if (midiActive) {
			// First four characters of midi function id, without the get_
			return control.config.signal?.config?.booster?.id.slice(3, 7)
		} else {
			return 'MIDI'
		}
	})

	let expanded = $state(false)
	let opacity = spring(0)
	let width = spring(16)
	let height = spring(16)

	$effect(() => {
		opacity.set(expanded ? 1 : 0)
		width.set(expanded ? 139 : 16)
		height.set(expanded ? 173 : 16)
	})
</script>

<div class="signalOptions">
	<button class="icon" onclick={() => (expanded = !expanded)}>
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
						class:enabled={control.config.signal?.config?.behaviour === 'straight'}
						onclick={() => {
							if (control.config.signal?.config)
								control.config.signal.config.behaviour = 'straight'
						}}
					>
						<OptionsStraightIcon />
					</button>
					<button
						class="button"
						class:enabled={control.config.signal?.config?.behaviour === 'loop'}
						onclick={() => {
							if (control.config.signal?.config)
								control.config.signal.config.behaviour = 'loop'
						}}
					>
						<OptionsLoopIcon />
					</button>
					<button
						class="button"
						class:enabled={control.config.signal?.config?.behaviour === 'pingpong'}
						onclick={() => {
							if (control.config.signal?.config)
								control.config.signal.config.behaviour = 'pingpong'
						}}
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
						class:enabled={control.config.signal?.config?.ease === 'linear'}
						onclick={() => {
							if (control.config.signal?.config) control.config.signal.config.ease = 'linear'
						}}
					>
						<EaseLinearIcon />
					</button>
					<button
						class="button"
						class:enabled={control.config.signal?.config?.ease === 'in'}
						onclick={() => {
							if (control.config.signal?.config) control.config.signal.config.ease = 'in'
						}}
					>
						<EaseInIcon />
					</button>
					<button
						class="button"
						class:enabled={control.config.signal?.config?.ease === 'out'}
						onclick={() => {
							if (control.config.signal?.config) control.config.signal.config.ease = 'out'
						}}
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
						class:enabled={control.config.signal?.config?.booster?.id === 'getBassPeaked'}
						onclick={() => {
							if (control.config.signal?.config)
								control.config.signal.config.booster =
									visualizerContext.audioAnalyzer.signals.getBassPeaked()
						}}
					>
						<span class="cpLabel">Bass</span>
					</button>
					<button
						class="button textLabel"
						class:enabled={control.config.signal?.config?.booster?.id === 'getMidsPeaked'}
						onclick={() => {
							if (control.config.signal?.config)
								control.config.signal.config.booster =
									visualizerContext.audioAnalyzer.signals.getMidsPeaked()
						}}
					>
						<span class="cpLabel">Mids</span>
					</button>
					<button
						class="button textLabel"
						class:enabled={control.config.signal?.config?.booster?.id === 'getHighsPeaked'}
						onclick={() => {
							if (control.config.signal?.config)
								control.config.signal.config.booster =
									visualizerContext.audioAnalyzer.signals.getHighsPeaked()
						}}
					>
						<span class="cpLabel">High</span>
					</button>
					<button
						class="button textLabel"
						class:enabled={control.config.signal?.config?.booster?.id === 'getVolumePeaked'}
						onclick={() => {
							if (control.config.signal?.config)
								control.config.signal.config.booster =
									visualizerContext.audioAnalyzer.signals.getVolumePeaked()
						}}
					>
						<span class="cpLabel">Volume</span>
					</button>
					<button
						class="button textLabel"
						class:enabled={control.config.signal?.config?.booster === undefined}
						onclick={() => {
							if (control.config.signal?.config)
								control.config.signal.config.booster = undefined
						}}
					>
						<span class="cpLabel">None</span>
					</button>
				</div>

				<div class="buttons">
					<button
						class="button textLabel"
						class:enabled={control.config.signal?.config?.booster?.context === 'midi'}
						onclick={async () => {
							// Toggle midiListening off if already midiListening
							if (visualizerContext.midi.listening) {
								visualizerContext.midi.cancelListenForMidiInput()
								return
							}

							const midiSignalId = await visualizerContext.midi.listenForMidiInput()
							if (!midiSignalId || !control.config.signal?.config) return null

							if (visualizerContext.midi.signals[midiSignalId])
								control.config.signal.config.booster =
									visualizerContext.midi.signals[midiSignalId]
						}}
					>
						<span class="">{midiLabel}</span>
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
