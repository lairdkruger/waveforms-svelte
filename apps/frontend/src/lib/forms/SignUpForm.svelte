<script lang="ts">
	import { page } from '$app/stores'
	import TextInput from './inputs/TextInput.svelte'
	import extractZodIssues from './utils/extractZodIssues'

	const formData = $page.form
	$: disabled = formData?.success
	$: issues = extractZodIssues(formData)
</script>

<div class="terms">
	<p>
		By registering you are agreeing to the
		<a href="/legal" target="_blank" rel="noreferrer">
			<span class="link">terms of service</span>
		</a>
		and
		<a href="/legal" target="_blank" rel="noreferrer">
			<span class="link">privacy policy</span>
		</a>
	</p>
</div>

<form method="POST" action="?/signup" novalidate>
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

	<button type="submit" {disabled}>Sign Up</button>
</form>

<style>
	.terms {
		margin-bottom: var(--spacing16);
	}

	form {
		width: 100%;
	}
</style>
