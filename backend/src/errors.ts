import { z } from "zod";

function parseError(zodError: z.ZodError): string[] {
    let { formErrors, fieldErrors } = zodError.flatten();
    return [
        ...formErrors,
        ...Object.entries(fieldErrors).map(
            ([property, message]) => `"${property}": ${message}`
        )
    ]
}

export { parseError };