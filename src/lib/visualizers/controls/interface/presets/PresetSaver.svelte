<script>
	import { enhance } from '$app/forms'
	import { invalidateAll } from '$app/navigation'
	import { page } from '$app/stores'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer.svelte'

	let visualizerContext = getVisualizerContext()
	let presetId = visualizerContext.controls.presets.preset
	let presets = visualizerContext.controls.presets.presets

	let presetMidiBinding = presets[presetId].midiBinding

	let formData = $page.form?.id === 'presetSaver' ? $page.form : undefined
	$: disabled = formData?.success

	let submitted = false
	$: buttonText = formData?.success ? 'Saved!' : submitted ? 'Saving...' : 'Save'
</script>

<div class="wrapper">
	<form
		class="form"
		method="POST"
		action="?/presetSaver"
		novalidate
		use:enhance={({ formData }) => {
			submitted = true

			// Append additional form data
			formData.append('presetId', presetId)

			let controlConfigs = visualizerContext.controls.extractCurrentControlConfigs()
			let controlConfigsString = JSON.stringify(controlConfigs)
			formData.append('controlsSchema', controlConfigsString)

			formData.append('presetMidiBinding', presetMidiBinding ?? '')

			return async ({ update }) => {
				await update()
				await invalidateAll()
				submitted = false
			}
		}}
	>
		<button class="submitButton" type="submit" {disabled}>{buttonText}</button>
	</form>
</div>

<style>
</style>
