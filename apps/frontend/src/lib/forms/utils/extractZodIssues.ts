export default function extractZodIssues(formData: any) {
	const issues: Record<string, string> = {}

	if (formData?.issues) {
		for (const issue of formData.issues) {
			issues[issue.path[0]] = issue.message
		}
	}

	return issues
}
