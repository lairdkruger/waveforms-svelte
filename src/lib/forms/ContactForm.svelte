<script lang="ts">
	import { page } from '$app/stores'
	import TextAreaInput from './inputs/TextAreaInput.svelte'
	import TextInput from './inputs/TextInput.svelte'

	const formData = $page.form
	let disabled = $derived(formData?.success)
</script>

<form method="POST" action="?/contact" novalidate>
	<TextInput name="name" value={formData?.data?.['name']} {disabled} />
	<TextInput name="email" type="email" value={formData?.data?.['email']} {disabled} />
	<TextInput name="subject" value={formData?.data?.['subject']} {disabled} />
	<TextAreaInput name="message" value={formData?.data?.['message']} {disabled} />

	<button type="submit" {disabled}>Submit</button>
</form>

<style>
	form {
		width: 100%;
	}
</style>
