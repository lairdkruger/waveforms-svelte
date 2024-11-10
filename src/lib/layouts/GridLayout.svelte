<script lang="ts">
	import type { Snippet } from 'svelte'

	interface Props {
		children: Snippet
	}

	let { children }: Props = $props()
</script>

<div class="grid">
	{@render children()}
</div>

<style>
	.grid {
		position: relative;
		width: 100%;
		min-height: 100vh;

		padding-left: var(--margin);
		padding-right: var(--margin);
		padding-top: var(--spacing200);

		display: grid;
		grid-template-columns: repeat(12, var(--column));
		grid-auto-rows: var(--row);
		grid-template-areas:
			'. . . block-1 block-1 . block-2 block-2 . block-3 block-3 .'
			'. . . block-4 block-4 . block-5 block-5 . block-6 block-6 .';

		justify-items: end;
		align-items: start;
	}

	@media (max-width: 768px) {
		.grid {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
		}
	}
</style>
