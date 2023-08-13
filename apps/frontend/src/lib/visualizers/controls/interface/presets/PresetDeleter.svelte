<script>
	import { enhance } from '$app/forms'
	import { page } from '$app/stores'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'

	const { controls } = getVisualizerContext()
	$: presetId = controls.presets.preset

	$: formData = $page.form?.id === 'presetDeleter' ? $page.form : undefined
	$: disabled = formData?.success

	let submitted = false
	$: buttonText = formData?.success ? 'Deleted!' : submitted ? 'Deleting...' : 'Delete'
</script>

<div class="wrapper">
	<form
		class="form"
		method="POST"
		action="?/presetDeleter"
		novalidate
		use:enhance={({ formData }) => {
			submitted = true

			// Append additional form data
			formData.append('presetId', presetId)

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
