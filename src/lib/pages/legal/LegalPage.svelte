<script lang="ts">
	import GridLayout from '$lib/layouts/GridLayout.svelte'
</script>

<GridLayout>
	<div class="privacy">
		<h2>Privacy Policy</h2>
		<p>
			WAVEFORMS subscription registration and authentication requires the collection and secure
			storage of a single email address
		</p>

		<p>This address is used only for:</p>
		<p>1) authenticating the user</p>
		<p>2) optional software update notifications</p>
	</div>

	<div class="terms">
		<h2>Terms of Use</h2>
		<p>
			You are permitted to record videos, take screenshots, and to share any content from
			WAVEFORMS granted you include the following link in your shared content:
		</p>

		<p>https://www.waveforms.app</p>
		<br />
		<p>
			The software is provided “AS IS”, without warranty of any kind, express or implied,
			including but not limited to the warranties of merchantability, fitness for a particular
			purpose and noninfringement. In no event shall the authors or copyright holders be liable
			for any claim, damages or other liability, whether in an action of contract, tort or
			otherwise, arising from, out of or in connection with the software or the use or other
			dealings in the software.
		</p>
	</div>
</GridLayout>

<style>
	div {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.privacy {
		grid-area: block-3;
	}

	.terms {
		grid-area: block-2;
	}

	@media (max-width: 768px) {
		div {
			margin-bottom: var(--sectionMargin);
		}
	}
</style>
