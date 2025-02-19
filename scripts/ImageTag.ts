import { validation } from "./validation";
import { throttle } from "../hoc/throtling";
import { calculateDistance } from "../utils/calculateDistance";

interface TagData {
  tagId: number;
  offsetX: number;
  offsetY: number;
  value: string;
}

export class ImageTag {
  private image: HTMLElement;
  private imageTags: TagData[];
  private delta = 70;
  private map = new Map();
  private tagId = 0;

  constructor(image: HTMLElement) {
    this.image = image;
    this.imageTags = [];
  }

  private positionofTag(tag: HTMLElement, x: number, y: number) {
    tag.style.setProperty("--top", `${y}px`);
    tag.style.setProperty("--left", `${x}px`);
  }

  private hideTag(tag: HTMLElement) {
    tag.classList.remove("tag");
    tag.classList.add("hide-tag");
  }

  private displayTag(tag: HTMLElement) {
    tag.classList.remove("hide-tag");
    tag.classList.add("tag");
  }

  private storeData(tag: HTMLInputElement) {
    const tagData: TagData = {
      tagId: this.tagId,
      value: tag.value,
      offsetX: tag.offsetLeft,
      offsetY: tag.offsetTop,
    };
    this.map.set(`${tag.offsetLeft}-${tag.offsetTop}`, false);
    this.imageTags.push(tagData);
    this.tagId += 1;
    tag.value = "";
  }

  showTags(closestTags: TagData) {
    //get the tags when within the delta range
    const tagExist: boolean = this.map.has(
      `${closestTags.offsetX}-${closestTags.offsetY}`
    );

    if (tagExist) {
      const tagValue: boolean = this.map.get(
        `${closestTags.offsetX}-${closestTags.offsetY}`
      );

      if (tagValue) {
        const tag = document.querySelectorAll<HTMLSpanElement>(".hide-tag");

        for (let i = 0; i < tag.length; i++) {
          if (closestTags.tagId === Number(tag[i].id)) {
            this.displayTag(tag[i]);
            if (tag !== null) {
              tag[i].textContent = closestTags.value;
              this.positionofTag(
                tag[i],
                closestTags.offsetX,
                closestTags.offsetY
              );
            }
          }
        }
      } else {
        const tag = document.createElement("span");
        tag.id = `${closestTags.tagId}`;
        tag.classList.add("tag");
        tag.textContent = closestTags.value;
        this.positionofTag(tag, closestTags.offsetX, closestTags.offsetY);

        this.map.set(`${closestTags.offsetX}-${closestTags.offsetY}`, true);
        2;
        this.image.appendChild(tag);
      }
    } else return;
  }

  getClosestTags(x1: number, y1: number) {
    for (let i = 0; i < this.imageTags.length; i++) {
      const distance = calculateDistance(
        x1,
        y1,
        this.imageTags[i].offsetX,
        this.imageTags[i].offsetY
      );

      if (distance <= this.delta) {
        this.showTags(this.imageTags[i]);
      } else {
        const tag = document.getElementById(`${this.imageTags[i].tagId}`);

        if (tag !== null) {
          this.hideTag(tag);
        }
      }
    }
  }

  getClickPositionHandler() {
    //to create tag in specific position(offset of clicked position)
    const tagInput = document.createElement("input");
    tagInput.classList.add("tag-input");

    const updateThrottledPoints = throttle((x1: number, y1: number) => {
      this.getClosestTags(x1, y1);
    }, 1000);

    this.image.addEventListener("click", (e) => {
      e.stopPropagation();

      let xPosition = e.offsetX;
      let yPosition = e.offsetY;
      this.positionofTag(tagInput, xPosition, yPosition);

      this.image.appendChild(tagInput);
      tagInput.focus();
    });

    this.image.addEventListener("mousemove", function (e) {
      e.stopImmediatePropagation();
      updateThrottledPoints(e.offsetX, e.offsetY);
    });

    tagInput.addEventListener("click", (e) => e.stopPropagation());

    tagInput.addEventListener("blur", (e) => {
      const valid = validation(tagInput);
      if (valid) {
        this.storeData(tagInput);
        this.image.removeChild(tagInput);
      } else {
        this.image.removeChild(tagInput);
      }
    });

    tagInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const valid = validation(tagInput);
        if (valid) {
          this.storeData(tagInput);
          this.image.removeChild(tagInput);
        } else {
          this.image.removeChild(tagInput);
        }
      }
    });
  }

  createTag() {
    this.getClickPositionHandler();
  }
}
