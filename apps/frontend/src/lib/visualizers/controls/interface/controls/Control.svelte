<script lang="ts">
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'
	import Connector from '../connectors/Connector.svelte'
	import BooleanControl from '../controllers/BooleanControl/BooleanControl.svelte'
	import SelectControl from '../controllers/SelectControl/SelectControl.svelte'

	export let controlId: string
	export let folderExpanded: boolean

	const { controls } = getVisualizerContext()
	const control = controls.getControl(controlId)

	$: console.log(control)
</script>

<div id={control.id} class="wrapper">
	<div class="control">
		{#if control.type === 'number'}
			<!-- <NumberControl {controlId} /> -->
		{:else if control.type === 'boolean'}
			<BooleanControl {controlId} />
		{:else if control.type === 'select'}
			<!-- <SelectControl {controlId} /> -->
		{:else if control.type === 'color'}
			<!-- <ColorControl {controlId} /> -->
		{/if}
	</div>

	<div class="connector">
		<Connector {controlId} />
	</div>
</div>

<style>
	.wrapper {
		position: relative;
	}

	.control {
		position: relative;
	}
</style>
