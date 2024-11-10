<script lang="ts">
	export let controlValue: number
	export let onValidated: (value: number) => void
	export let disabled: boolean = false
	export let isHandle: boolean = false

	let inputValue: number | string = controlValue
	let showCurrentValue: boolean = true

	const validateInput = (event: Event) => {
		const target = event.target as HTMLInputElement
		const value = target.value

		const isValid = !isNaN(Number(value)) // Check to see if value is a valid number
		inputValue = value

		if (isValid) onValidated(Number(value))
	}

	const handleBlur = () => {
		inputValue = controlValue
		showCurrentValue = true
	}

	const cancelEvent = (event: Event) => {
		event.preventDefault()
		event.stopPropagation()
		handleBlur()
	}
</script>

<input
	class="g-numberInput"
	class:draggable={isHandle}
	readOnly={disabled}
	{disabled}
	step={0.1}
	value={showCurrentValue ? controlValue : inputValue}
	onchange={validateInput}
	onmousemove={cancelEvent}
	onfocus={() => (showCurrentValue = false)}
	onblur={handleBlur}
/>
