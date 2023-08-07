<script lang="ts">
	import { page } from '$app/stores'
	import TextInput from './inputs/TextInput.svelte'
	import extractZodIssues from './utils/extractZodIssues'

	const formData = $page.form
	const disabled = formData?.success

	const issues = extractZodIssues(formData)

	let submitted = false
	$: buttonText = formData?.success ? 'Updated' : submitted ? 'Updating...' : 'Update'
</script>

<form method="POST" action="?/update" novalidate on:submit={() => (submitted = true)}>
	<TextInput
		name="email"
		type="email"
		issue={issues?.['email']}
		value={formData?.data?.['email']}
		{disabled}
	/>
	<TextInput
		name="password"
		type="password"
		issue={issues?.['password']}
		value={formData?.data?.['password']}
		{disabled}
	/>

	{#if formData?.message}
		<p>{formData?.message}</p>
	{/if}

	<button type="submit" {disabled}>{buttonText}</button>
</form>

<style>
	form {
		width: 100%;
	}
</style>
