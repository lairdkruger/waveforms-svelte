<script lang="ts">
	import UpdateAccountForm from '$lib/forms/UpdateAccountForm.svelte'
	import GridLayout from '$lib/layouts/GridLayout.svelte'
</script>

<GridLayout>
	<div class="management">
		<h2>Update Information</h2>
		<UpdateAccountForm />
	</div>
	<div class="information">
		<h2>Manage Account</h2>

		<!-- <button class="link" on:click={() => handleCheckout()} disabled={subscribed}>
			Become a Supporter
		</button>
		<button class="link" on:click={() => handleCustomerPortal()} disabled={!subscribed}>
			Stripe Customer Portal
		</button> -->
	</div>

	<div class="logout">
		<a href="/auth/logout">Logout </a>
	</div>
</GridLayout>

<style>
	div {
		width: 100%;
	}

	.management {
		grid-area: block-2;
	}

	.information {
		grid-area: block-3;
	}

	.logout {
		grid-area: block-6;
	}

	@media (max-width: 768px) {
		div {
			margin-bottom: var(--sectionMargin);
		}
	}
</style>
