import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

export default async function loadFfmpeg(): Promise<FFmpeg> {
  if (typeof window !== "undefined") {
    const ffmpeg = new FFmpeg();
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    return ffmpeg;
  } else {
    throw new Error(
      "Window is not defined. FFmpeg can only be loaded in a browser environment."
    );
  }
}
