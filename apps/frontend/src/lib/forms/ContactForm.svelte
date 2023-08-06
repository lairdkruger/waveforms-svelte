<script lang="ts">
	import TextAreaInput from './inputs/TextAreaInput.svelte'
	import TextInput from './inputs/TextInput.svelte'
	import type { z } from 'zod'

	export let formData: any
	const disabled = formData?.success

	// Convert array of issues into object
	const issues: Record<string, string> = formData?.issues?.reduce(
		(acc: Record<string, string>, issue: z.ZodIssue) => {
			acc[issue.path[0]] = issue.message
			return acc
		},
		{}
	)
</script>

<form method="POST" action="?/contact">
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
