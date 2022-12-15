export interface FileInfo {
    buffer: Buffer,
    mimetype: string,
    originalname: string,
    size: number,
    referenceUrl?: string,
    analyzed?: Date
}