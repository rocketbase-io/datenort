export interface FormattedAsset {
    id: string,
    urlPath: string,
    bucket: string,
    type: string,
    created: Date,
    originalFilename: string,
    referenceUrl?: string,
    fileSize: string,
    imageData?: {
        blurHash: string,
        resolution: {
            width: number,
            height: number
        },
        colorPalette: {
            colors: string[],
            primary: string
        }
    }
    download: string
}
