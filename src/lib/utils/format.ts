export function formatDate(dateGmt: string): string {
    return new Date(dateGmt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

export function formatDateShort(dateGmt: string): string {
    return new Date(dateGmt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
