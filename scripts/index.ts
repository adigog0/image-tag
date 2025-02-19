import { ImageTag } from "./ImageTag";

const Image = document.getElementById("image-container") as HTMLElement;

const imageContainer = new ImageTag(Image);
imageContainer.createTag();
