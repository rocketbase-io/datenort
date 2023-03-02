import {Property} from "@tsed/schema";

export class FormattedAsset {
    @Property()
    id: string;
    @Property()
    urlPath?: string;
    @Property()
    bucket?: string;
    @Property()
    type: string;
    @Property()
    created: Date;
    @Property()
    originalFilename: string;
    @Property()
    referenceUrl?: string;
    @Property()
    analyzed?: Date;
    @Property()
    fileSize: number;
    @Property()
    fileSizeHumanReadable: string;
    @Property()
    imageData?: {
        blurHash: string
        resolution: {
            width: number
            height: number
        },
        colorPalette: {
            colors: string[],
            primary: string
        }
    };
    @Property()
    download?: string
}
