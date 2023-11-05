<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import TextInput from './inputs/TextInput.svelte'
	import extractZodIssues from './utils/extractZodIssues'

	const formData = $page.form
	$: disabled = formData?.success
	$: issues = extractZodIssues(formData)

	$: submitButtonText = formData?.success ? 'Password Updated!' : 'Update Password'
	$: if (formData?.success) {
		setTimeout(() => {
			goto('/')
		}, 1500)
	}
</script>

<form method="POST" action="?/updatePassword" novalidate>
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

	<button type="submit" {disabled}>{submitButtonText}</button>
</form>

<style>
	form {
		width: 100%;
	}
</style>
