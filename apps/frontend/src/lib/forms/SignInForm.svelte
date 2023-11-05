<script lang="ts">
	import { page } from '$app/stores'
	import TextInput from './inputs/TextInput.svelte'
	import extractZodIssues from './utils/extractZodIssues'
	import { goto } from '$app/navigation'
	import { browser } from '$app/environment'

	const formData = $page.form
	$: disabled = formData?.success
	$: issues = extractZodIssues(formData)

	let submitted = false
	$: buttonText = formData?.success ? 'Success!' : submitted ? 'Signing In...' : 'Enter'

	let forgotPasswordSubmitted = false
	$: forgotPasswordButtonText = formData?.success
		? 'Reset Link Sent'
		: forgotPasswordSubmitted
		? 'Sending Reset Link...'
		: 'Forgot Password?'

	// On success, pause for a moment then redirect to the home page
	$: {
		if (browser && submitted && formData?.success) {
			setTimeout(() => {
				goto('/')
			}, 1500)
		}
	}
</script>

<form
	method="POST"
	action="?/signin"
	novalidate
	on:submit={(e) => {
		// Handle different submit cases
		if (e.submitter?.id === 'submit') {
			submitted = true
		} else if (e.submitter?.id === 'forgotPassword') {
			forgotPasswordSubmitted = true
		}
	}}
>
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

	<div class="buttons">
		<button id="submit" type="submit" {disabled}>{buttonText}</button>
		<button id="forgotPassword" class="forgotPasswordButton" formaction="?/forgotPassword"
			>{forgotPasswordButtonText}</button
		>
	</div>
</form>

<style>
	form {
		width: 100%;
	}

	.buttons {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.forgotPasswordButton {
		align-self: flex-end;
	}
</style>
