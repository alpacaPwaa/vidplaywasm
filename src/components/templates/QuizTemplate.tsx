"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function QuizTemplate() {
  const [transcodeFile, setTranscodeFile] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState("/templates/template1/video1.mp4");

  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef<HTMLParagraphElement | null>(null);

  const [promptText, setPromptText] = useState("");
  const [promtError, setPromptError] = useState("");

  const handleChangePrompt = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptText(e.target.value);
  };

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      if (messageRef.current) messageRef.current.innerHTML = message;
    });
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
  };

  const transcode = async () => {
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));
    await ffmpeg.writeFile(
      "arial.ttf",
      await fetchFile(
        "https://raw.githubusercontent.com/ffmpegwasm/testdata/master/arial.ttf"
      )
    );

    // Command for adding both text overlays in a single pass
    await ffmpeg.exec([
      "-i",
      "input.mp4",
      "-vf",
      "drawtext=fontfile=/arial.ttf:text='First Text':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=24:fontcolor=white:enable='between(t,0,8)',drawtext=fontfile=/arial.ttf:text='Second Text':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=24:fontcolor=white:enable='between(t,8,10)'",
      "-preset",
      "ultrafast",
      "output.mp4",
    ]);

    const data = (await ffmpeg.readFile("output.mp4")) as any;
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "video/mp4" })
    );
    setTranscodeFile(url);
  };

  useEffect(() => {
    (async () => {
      if (typeof window === "undefined") return;
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;
      await load();
    })();
  }, []);

  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/* Left sidebar */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6 bg-zinc-50">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="video">Video</TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <div className="flex flex-col space-y-5">
                  <div className="relative flex flex-col space-y-3">
                    <label htmlFor="text-area" className="text-md font-medium">
                      Enter a topic
                    </label>
                    <textarea
                      id="text-area"
                      name="prompt"
                      value={promptText}
                      onChange={handleChangePrompt}
                      className={`w-full rounded-md border ${
                        promtError ? "border-red-500" : "border-gray-300"
                      } p-2 text-gray-800 bg-zinc-50 focus:border-blue-500 focus:outline-none`}
                      style={{
                        borderRadius: "8px",
                        width: "100%",
                      }}
                      placeholder="Example: Geography Quiz"
                    />

                    <button
                      className={
                        "bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition duration-300 ease-in-out"
                      }
                    >
                      Generate Quiz
                    </button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="video">
                <div className="flex flex-col space-y-5">
                  <div className="relative flex flex-col space-y-3">
                    <label
                      htmlFor="template-videos"
                      className="text-md font-medium"
                    >
                      Select a background video
                    </label>
                    <div
                      id="template-videos"
                      className="relative flex flex-col space-y-3 max-h-[170px] overflow-y-auto border border-gray-300 rounded-md p-3"
                    >
                      <div
                        className={`template-container border rounded-md p-2 cursor-pointer flex items-center ${
                          videoFile === "/templates/template1/video1.mp4"
                            ? "border-blue-500"
                            : "border-gray-300"
                        }`}
                        onClick={() =>
                          setVideoFile("/templates/template1/video1.mp4")
                        }
                      >
                        <div className="template-video bg-gray-200 rounded-sm">
                          <video
                            src="/templates/template1/video1.mp4"
                            className="w-20 h-12 p-1"
                          ></video>
                        </div>
                        <div className="template-info text-center flex-grow pl-4">
                          <div className="h-full flex font-medium text-md">
                            Video 1
                          </div>
                        </div>
                      </div>
                      <div
                        className={`template-container border rounded-md p-2 cursor-pointer flex items-center ${
                          videoFile === "/templates/template1/video2.mp4"
                            ? "border-blue-500"
                            : "border-gray-300"
                        }`}
                        onClick={() =>
                          setVideoFile("/templates/template1/video2.mp4")
                        }
                      >
                        <div className="template-video bg-gray-200 rounded-sm">
                          <video
                            src="/templates/template1/video2.mp4"
                            className="w-20 h-12 p-1"
                          ></video>
                        </div>
                        <div className="template-info text-center flex-grow pl-3">
                          <div className="h-full flex font-medium text-md">
                            Video 2
                          </div>
                        </div>
                      </div>
                      <div
                        className={`template-container border rounded-md p-2 cursor-pointer flex items-center ${
                          videoFile === "/templates/template1/video3.mp4"
                            ? "border-blue-500"
                            : "border-gray-300"
                        }`}
                        onClick={() =>
                          setVideoFile("/templates/template1/video3.mp4")
                        }
                      >
                        <div className="template-video bg-gray-200 rounded-sm">
                          <video
                            src="/templates/template1/video3.mp4"
                            className="w-20 h-12 p-1"
                          ></video>
                        </div>
                        <div className="template-info text-center flex-grow pl-3">
                          <div className="h-full flex font-medium text-md">
                            Video 3
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={transcode}
                    className={
                      "bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition duration-300 ease-in-out"
                    }
                  >
                    Transcode File
                  </button>
                  <p ref={messageRef}></p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="shrink-0 flex-[2] lg:w-96 flex justify-center items-center">
          <div className="max-h-[540px] overflow-y-auto">
            {transcodeFile ? (
              <div className="flex flex-col justify-center items-center space-y-6">
                <video src={transcodeFile} controls />
              </div>
            ) : (
              <p>Select a Background Video to Get Started</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
