export async function fetchAsDataUrl(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
}
