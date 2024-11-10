<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'
	import AudioInputSelector from './AudioInputSelector.svelte'
	import Signal from './Signal.svelte'

	const { audioAnalyzer } = getVisualizerContext()

	const signals = audioAnalyzer.getSignals()
</script>

<div class="signalsPanel">
	<div class="signalsContainer">
		<!-- Volume Group -->
		<div class="signalsGroup">
			<div class="signals">
				<!-- Volume -->
				<div class="signalGroup">
					<Signal signal={signals.getVolume} type={'number'} />
					<Signal signal={signals.getVolumePeaked} type={'boolean'} />
				</div>
			</div>
			<div class="diagram">
				<div class="volumeIcon">
					<div class="volumeIconLine"></div>
					<div class="volumeIconLine"></div>
				</div>
				<div class="diagramLabel">
					<span class="cpLabel">Volume</span>
				</div>
			</div>
		</div>

		<!-- Spectrum Group -->
		<div class="signalsGroup">
			<div class="signals">
				<!-- Bass  -->
				<div class="signalGroup">
					<Signal signal={signals.getBassVolume} type={'number'} />
					<Signal signal={signals.getBassPeaked} type={'boolean'} />
				</div>
				<!-- Mids  -->
				<div class="signalGroup">
					<Signal signal={signals.getMidsVolume} type={'number'} />
					<Signal signal={signals.getMidsPeaked} type={'boolean'} />
				</div>
				<!-- Highs  -->
				<div class="signalGroup">
					<Signal signal={signals.getHighsVolume} type={'number'} />
					<Signal signal={signals.getHighsPeaked} type={'boolean'} />
				</div>
			</div>
			<div class="diagram">
				<div class="spectrumIcon">
					<div class="spectrumIconLine"></div>
					<div class="spectrumIconLine"></div>
					<div class="spectrumIconLine"></div>
					<div class="spectrumIconLine"></div>
					<div class="spectrumIconLine"></div>
				</div>
				<div class="diagramLabel">
					<div class="spectrumDiagramLabels">
						<div class="spectrumDiagramLabel">
							<span class="cpLabel">Bass</span>
						</div>
						<div class="spectrumDiagramLabel">
							<span class="cpLabel">Mids</span>
						</div>
						<div class="spectrumDiagramLabel">
							<span class="cpLabel">Highs</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="audioInputSelector">
		<AudioInputSelector />
	</div>
</div>

<style>
	.signalsPanel {
		position: relative;
		width: var(--cpSignalsPanelWidth);
		height: var(--cpSignalsPanelHeight);
		background-color: var(--cpColorPrimary);
		border: 1px solid var(--cpColorSecondary);
		border-top: none;
		padding: 0 var(--cpSpacing24) 0 var(--cpSpacing24);
		top: -1px; /* Overlap control panel to cover the border */
	}

	.signalsContainer {
		position: relative;
		width: 100%;
		height: calc(100% - 24px);
		display: grid;
		grid-template-columns: 1fr 3fr;
		column-gap: var(--cpSpacing16);
	}

	.signalsGroup {
		width: 100%;
		height: 100%;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.signals {
		position: relative;
		width: 100%;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(0, auto);
		align-items: center;
		justify-items: center;
		height: var(--cpSignalHeight);

		padding: 0 var(--cpSpacing16); /* Eyeball adjustment */
	}

	.signalGroup {
		transform: rotateZ(-90deg);
		transform-origin: 50% 50%;
	}

	.signalGroup:first-child {
		justify-self: end;
	}

	.signalGroup:last-child {
		justify-self: start;
	}

	.signalGroup:only-child {
		justify-self: center;
	}

	.diagram {
		width: 100%;
		margin-top: var(--cpSpacing4);
		display: grid;
		grid-auto-flow: column;
		grid-template-rows: var(--cpSpacing8) auto;
		row-gap: var(--cpSpacing2);
		justify-items: center;
	}

	.volumeIcon {
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-rows: auto;
		row-gap: var(--cpSpacing2);
	}

	.volumeIconLine {
		background-color: var(--cpColorSecondary);
	}

	.spectrumIcon {
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-columns: 6fr 5fr 4fr 3fr 2fr;
		column-gap: var(--cpSpacing4);
	}

	.spectrumIconLine {
		background-color: var(--cpColorSecondary);
	}

	.diagramLabel {
		width: 100%;
	}

	.spectrumDiagramLabels {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		justify-items: center;
	}

	.spectrumDiagramLabel:first-child {
		justify-self: start;
	}

	.spectrumDiagramLabel:first-child {
		justify-self: end;
	}
</style>
