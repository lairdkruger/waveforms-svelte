<script lang="ts">
	import PasswordUpdateForm from '$lib/forms/PasswordUpdateForm.svelte'
	import GridLayout from '$lib/layouts/GridLayout.svelte'
</script>

<GridLayout>
	<div class="password-update">
		<h2>Update Password</h2>
		<PasswordUpdateForm />
	</div>
</GridLayout>

<style>
	div {
		width: 100%;
	}

	.password-update {
		grid-area: block-2;
	}

	@media (max-width: 768px) {
		div {
			margin-bottom: var(--sectionMargin);
		}
	}
</style>
