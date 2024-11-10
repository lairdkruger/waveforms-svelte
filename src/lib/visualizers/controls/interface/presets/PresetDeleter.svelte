<script>
	import { enhance } from '$app/forms'
	import { invalidateAll } from '$app/navigation'
	import { page } from '$app/stores'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'

	const { controls } = getVisualizerContext()
	const presetId = controls.presets.preset

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
			formData.append('presetId', $presetId)

			return async ({ update }) => {
				await update()
				submitted = false
				invalidateAll()
			}
		}}
	>
		<button class="submitButton" type="submit" {disabled}>{buttonText}</button>
	</form>
</div>

<style>
</style>
