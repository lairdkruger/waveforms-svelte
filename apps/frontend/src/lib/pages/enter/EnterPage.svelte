<script lang="ts">
	import SignInForm from '$lib/forms/SignInForm.svelte'
	import SignUpForm from '$lib/forms/SignUpForm.svelte'
	import GridLayout from '$lib/layouts/GridLayout.svelte'

	let enterMethod: 'signIn' | 'signUp' = 'signIn'
	$: heading = enterMethod === 'signIn' ? 'Sign In' : 'Sign Up'
</script>

<GridLayout>
	<div class="enter">
		<div class="heading">
			<h2>{heading}</h2>
		</div>

		{#if enterMethod === 'signIn'}
			<SignInForm />
		{:else}
			<SignUpForm />
		{/if}

		<button
			class="form-toggle"
			on:click={() => (enterMethod = enterMethod === 'signIn' ? 'signUp' : 'signIn')}
		>
			{enterMethod === 'signIn' ? 'Sign up instead?' : 'Sign in instead?'}
		</button>
	</div>
</GridLayout>

<style>
	.enter {
		width: 100%;
		grid-area: block-3;
	}

	.form-toggle {
		margin-top: var(--spacing16);
	}
</style>
