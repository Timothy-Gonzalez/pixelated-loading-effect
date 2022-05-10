// Wait for page load, and then run on our elements
window.addEventListener("DOMContentLoaded", () => {
	// You can totally mess around with different class names if you want
	let elements = document.body.getElementsByClassName("pixelatedLoadingEffect")

	for (const imageElement of elements) {
		const canvas = document.createElement("canvas")
		canvas.innerHTML = imageElement.innerHTML

		for (const attribute of imageElement.getAttributeNames()) {
			canvas.setAttribute(attribute, imageElement.getAttribute(attribute))
		}

		imageElement.parentElement.replaceChild(canvas, imageElement)


		// Remove no JS support
		canvas.style.opacity = 1
		canvas.style.animation = "none"

		const style = getComputedStyle(canvas)
		const timeToVisible = toMS(style.getPropertyValue("--time"))
		const delay = toMS(style.getPropertyValue("--delay"))
		const image = new Image()

		image.addEventListener("load", () => {
			// Keep canvas rendering width consistent with image width and height. Note that this can still be changed with CSS.
			canvas.width = image.width
			canvas.height = image.height

			// Define context
			let context = canvas.getContext("2d")

			// Disable image aliasing
			let properties = ["msImageSmoothingEnabled", "mozImageSmoothingEnabled", "webkitImageSmoothingEnabled", "imageSmoothingEnabled"]
			for (property of properties) {
				context[property] = false
			}

			// Start running on load, and timeout
			runOn(canvas, context, image, timeToVisible, false, delay)
		})

		image.src = imageElement.src
	}
})

// Begins running pixelated loading effect on specified element
function runOn(canvas, context, image, timeToVisible, started, delay) {
	if (started == false) {
		started = Date.now()
	}

	const width = canvas.width
	const height = canvas.height

	// Get progress towards completion
	const delta = Math.max(0, Math.min(1, (Date.now() - started - delay) / timeToVisible))

	// Compute factor which is within bounds, above minimum, and divides evenly
	const factorDelta = Math.min(1, Math.pow(delta, 7))
	const factorMin = 0.01
	const factor = factorMin + factorDelta * (1 - factorMin)

	const idealDivisions = Math.floor(width / (1 / factor))
	const boundedFactor = idealDivisions / width

	// Get smaller sizes to draw with
	const smallWidth = width * boundedFactor,
		smallHeight = height * boundedFactor

	// Draw the original image, but really small
	context.drawImage(image, 0, 0, smallWidth, smallHeight);

	// Enlarge this small image to full size
	context.drawImage(canvas, 0, 0, smallWidth, smallHeight, 0, 0, width, height)

	if (delta == 1) {
		return
	}

	setTimeout(runOn, 0, canvas, context, image, timeToVisible, started, delay)
}

// Utility method to convert CSS time (1.5s, 500ms, etc.) to milliseconds. Credit: https://stackoverflow.com/a/30546115
function toMS(s) {
	return parseFloat(s) * (/\ds$/.test(s) ? 1000 : 1);
}