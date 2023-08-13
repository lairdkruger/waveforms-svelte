<script>
	import { enhance } from '$app/forms'
	import { page } from '$app/stores'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'

	const { controls } = getVisualizerContext()
	$: presetId = controls.presets.preset
	$: controlsSchemaObject = controls.controls.controls
	$: controlsSchema = JSON.stringify(controlsSchemaObject)
	$: presetMidiBinding = controls.presets.presets[presetId].midiBinding

	$: formData = $page.form?.id === 'presetSaver' ? $page.form : undefined
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
			formData.append('controlsSchema', controlsSchema)
			formData.append('presetMidiBinding', presetMidiBinding ?? '')

			return async ({ update }) => {
				await update()
				submitted = false
			}
		}}
	>
		<button class="submitButton" type="submit" {disabled}>{buttonText}</button>
	</form>
</div>

<style>
</style>
