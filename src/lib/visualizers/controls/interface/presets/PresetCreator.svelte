<script>
	import { enhance } from '$app/forms'
	import { invalidateAll } from '$app/navigation'
	import { page } from '$app/stores'
	import TextInput from '$lib/forms/inputs/TextInput.svelte'
	import { getVisualizerContext } from '$lib/visualizers/contexts/visualizer'

	const visualizerSlug = $page.params.slug

	const { controls } = getVisualizerContext()

	$: formData = $page.form?.id === 'presetCreator' ? $page.form : undefined
	$: disabled = formData?.success

	let submitted = false
	$: buttonText = formData?.success ? 'Created!' : submitted ? 'Creating...' : 'Create'
</script>

<div class="wrapper">
	<form
		class="form"
		method="POST"
		action="?/presetCreator"
		novalidate
		use:enhance={({ formData }) => {
			submitted = true

			// Append additional form data
			formData.append('visualizerSlug', visualizerSlug)

			// Format controls schema into DB friendly format
			const controlConfigs = controls.extractCurrentControlConfigs()
			const controlConfigsString = JSON.stringify(controlConfigs)
			formData.append('controlsSchema', controlConfigsString)

			return async ({ update }) => {
				await update()
				submitted = false
				invalidateAll()
			}
		}}
	>
		<div class="inputs">
			<div class="input">
				<TextInput
					name="name"
					type="name"
					value={formData?.data?.['name']}
					placeholder="Preset Name"
					{disabled}
				/>
			</div>
		</div>

		<button class="submitButton" type="submit" {disabled}>{buttonText}</button>
	</form>
</div>

<style>
	.wrapper {
		width: 100%;
	}

	.form {
		position: relative;
		width: 100%;

		display: flex;
		flex-direction: row;
		column-gap: var(--cpSpacing4);
		align-items: flex-start;
	}

	.inputs {
		width: 100%;
		text-align: left;
	}

	.input {
		margin-bottom: var(--cpSpacing8);
	}

	.submitButton {
		position: absolute;
		right: 0;
	}
</style>
