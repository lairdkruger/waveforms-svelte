<script lang="ts">
	import { page } from '$app/stores'
	import TextAreaInput from './inputs/TextAreaInput.svelte'
	import TextInput from './inputs/TextInput.svelte'
	import extractZodIssues from './utils/extractZodIssues'

	const formData = $page.form
	$: disabled = formData?.success
	$: issues = extractZodIssues(formData)
</script>

<form method="POST" action="?/contact" novalidate>
	<TextInput name="name" issue={issues?.['name']} value={formData?.data?.['name']} {disabled} />
	<TextInput
		name="email"
		type="email"
		issue={issues?.['email']}
		value={formData?.data?.['email']}
		{disabled}
	/>
	<TextInput
		name="subject"
		issue={issues?.['subject']}
		value={formData?.data?.['subject']}
		{disabled}
	/>
	<TextAreaInput
		name="message"
		issue={issues?.['message']}
		value={formData?.data?.['message']}
		{disabled}
	/>

	<button type="submit" {disabled}>Submit</button>
</form>

<style>
	form {
		width: 100%;
	}
</style>
