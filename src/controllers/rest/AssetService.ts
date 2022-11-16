import {PlatformMulterFile} from "@tsed/common";

export function uploadAsset(file : PlatformMulterFile) : Object {
    return {"file-type": file.mimetype};
}