"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/app/_trpc/client";
import { Button } from "../ui/button";
import { Ghost, Loader2 } from "lucide-react";

export default function QuizTemplate() {
  const [transcodeFile, setTranscodeFile] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState("/templates/template1/video1.mp4");
  const [voice, setVoice] = useState<
    "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer"
  >("alloy");

  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef<HTMLParagraphElement | null>(null);

  const [firstSpeechError, setfirstSpeechError] = useState("");
  const [firstSpeechDownload, setFirstSpeechDownload] = useState<string>("");
  const [secondSpeechDownload, setSecondSpeechDownload] = useState<string>("");
  const [thirdSpeechDownload, setThirdSpeechDownload] = useState<string>("");
  const [fourthSpeechDownload, setFourthSpeechDownload] = useState<string>("");
  const [fifthSpeechDownload, setFifthSpeechDownload] = useState<string>("");

  const [firstQuestionOnly, setFirstQuestionOnly] = useState("");
  const [firstQuestion, setFirstQuestion] = useState("");
  const [firstAnswer, setFirstAnswer] = useState("");

  const [secondQuestionOnly, setSecondQuestionOnly] = useState("");
  const [secondQuestion, setSecondQuestion] = useState("");
  const [secondAnswer, setSecondAnswer] = useState("");

  const [thirdQuestionOnly, setThirdQuestionOnly] = useState("");
  const [thirdQuestion, setThirdQuestion] = useState("");
  const [thirdAnswer, setThirdAnswer] = useState("");

  const [fourthQuestionOnly, setFourthQuestionOnly] = useState("");
  const [fourthQuestion, setFourthQuestion] = useState("");
  const [fourthAnswer, setFourthAnswer] = useState("");

  const [fifthQuestionOnly, setFifthQuestionOnly] = useState("");
  const [fifthQuestion, setFifthQuestion] = useState("");
  const [fifthAnswer, setFifthAnswer] = useState("");

  const [promptText, setPromptText] = useState("");
  const [promtError, setPromptError] = useState("");

  const { mutate: generateQuizScript, isLoading: isQuizScriptLoading } =
    trpc.generateQuizScript.useMutation({
      onSuccess: async (data) => {
        const question1 = data.firstQuestion;
        const joinedQuestion1 = data.joinedFirstQuestionAndChoices;
        const answer1 = data.firstAnswer;

        const question2 = data.secondQuestion;
        const joinedQuestion2 = data.joinedSecondQuestionAndChoices;
        const answer2 = data.secondAnswer;

        const question3 = data.thirdQuestion;
        const joinedQuestion3 = data.joinedThirdQuestionAndChoices;
        const answer3 = data.thirdAnswer;

        const question4 = data.fourthQuestion;
        const joinedQuestion4 = data.joinedFourthQuestionAndChoices;
        const answer4 = data.fourthAnswer;

        const question5 = data.fifthQuestion;
        const joinedQuestion5 = data.joinedFifthQuestionAndChoices;
        const answer5 = data.fifthAnswer;

        setFirstQuestionOnly(question1);
        setFirstQuestion(joinedQuestion1);
        setFirstAnswer(answer1);

        setSecondQuestionOnly(question2);
        setSecondQuestion(joinedQuestion2);
        setSecondAnswer(answer2);

        setThirdQuestionOnly(question3);
        setThirdQuestion(joinedQuestion3);
        setThirdAnswer(answer3);

        setFourthQuestionOnly(question4);
        setFourthQuestion(joinedQuestion4);
        setFourthAnswer(answer4);

        setFifthQuestionOnly(question5);
        setFifthQuestion(joinedQuestion5);
        setFifthAnswer(answer5);

        console.log("First Question", joinedQuestion1);
        console.log("Second Question", joinedQuestion2);
        console.log("Third Question", joinedQuestion3);
        console.log("Fourth Question", joinedQuestion4);
        console.log("Fifth Question", joinedQuestion5);
      },
      onError: (error) => {
        console.error("Error Generating Quiz:", error);
      },
    });

  const { mutate: generateTtsSpeech, isLoading: isSpeechLoading } =
    trpc.generateQuizSpeech.useMutation({
      onSuccess: async (data) => {
        const firstSpeechFile = data.firstSpeech;
        const secondSpeechFile = data.secondSpeech;
        const thirdSpeechFile = data.thirdSpeech;
        const fourthSpeechFile = data.fourthSpeech;
        const fifthSpeechFile = data.fifthSpeech;

        setFirstSpeechDownload(firstSpeechFile);
        setSecondSpeechDownload(secondSpeechFile);
        setThirdSpeechDownload(thirdSpeechFile);
        setFourthSpeechDownload(fourthSpeechFile);
        setFifthSpeechDownload(fifthSpeechFile);
        console.log("First Speech Done", firstSpeechFile);
        console.log("Second Speech Done", secondSpeechFile);
        console.log("Third Speech Done", thirdSpeechFile);
        console.log("Fourth Speech Done", fourthSpeechFile);
        console.log("Fifth Speech Done", fifthSpeechFile);
      },
    });

  const handleGenerateQuiz = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    if (!promptText) {
      setPromptError("Please write a prompt");
      return; // Early return if prompt is empty
    }
    console.log("clicked"); // Log before mutation

    try {
      generateQuizScript({ prompt: promptText });
    } catch (error) {
      console.error("Error Generating Speech:", error);
      // Handle error gracefully, e.g., display an error message to the user
    }
  };

  const handleGenerateSpeech = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();

    console.log("clicked");

    try {
      generateTtsSpeech({
        speechVoice: voice,
        firstQuestion: firstQuestionOnly,
        secondQuestion: secondQuestionOnly,
        thirdQuestion: thirdQuestionOnly,
        fourthQuestion: fourthQuestionOnly,
        fifthQuestion: fifthQuestionOnly,
      });
    } catch (error) {
      console.error("Error Generating Quiz:", error);
    }
  };

  const handleChangePrompt = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptText(e.target.value);
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

    // Command for adding text overlay and speech file to the input video
    await ffmpeg.exec([
      "-i",
      "input.mp4",
      "-vf",
      `drawtext=fontfile=/arial.ttf:text='${firstQuestion}':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=55:fontcolor=white:enable='between(t,5,13)',
      drawtext=fontfile=/arial.ttf:text='${firstAnswer}':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=55:fontcolor=white:enable='between(t,13,15)',
      drawtext=fontfile=/arial.ttf:text='${secondQuestion}':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=55:fontcolor=white:enable='between(t,15,23)',
      drawtext=fontfile=/arial.ttf:text='${secondAnswer}':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=55:fontcolor=white:enable='between(t,23,25)',
      drawtext=fontfile=/arial.ttf:text='${thirdQuestion}':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=55:fontcolor=white:enable='between(t,25,33)',
      drawtext=fontfile=/arial.ttf:text='${thirdAnswer}':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=55:fontcolor=white:enable='between(t,33,35)',
      drawtext=fontfile=/arial.ttf:text='${fourthQuestion}':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=55:fontcolor=white:enable='between(t,35,43)',
      drawtext=fontfile=/arial.ttf:text='${fourthAnswer}':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=55:fontcolor=white:enable='between(t,43,45)',
      drawtext=fontfile=/arial.ttf:text='${fifthQuestion}':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=55:fontcolor=white:enable='between(t,45,53)',
      drawtext=fontfile=/arial.ttf:text='${fifthAnswer}':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=55:fontcolor=white:enable='between(t,53,55)'`,
      "-preset",
      "ultrafast",
      "-c:a",
      "copy",
      "-c:v",
      "libx264",
      "output.mp4",
    ]);

    // await ffmpeg.exec([
    //   "-an",
    //   "-i",
    //   "input.mp4",
    //   "-i",
    //   "firstSpeechInput.mp3",
    //   "-i",
    //   "secondSpeechInput.mp3",
    //   "-filter_complex",
    //   "[2]adelay=10000|10000[a1];[a1][1]amix=inputs=2[a]",
    //   "-map",
    //   "0:v",
    //   "-map",
    //   "[a]",
    //   "-c:v",
    //   "copy",
    //   "output.mp4",
    // ]);

    const data = (await ffmpeg.readFile("output.mp4")) as any;
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "video/mp4" })
    );
    setTranscodeFile(url);
  };

  useEffect(() => {
    const load = async () => {
      if (typeof window !== "undefined") {
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
        const ffmpeg = ffmpegRef.current;
        ffmpeg.on("log", ({ message }) => {
          if (messageRef.current) messageRef.current.innerHTML = message;
        });
        await ffmpeg.load({
          coreURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            "text/javascript"
          ),
          wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            "application/wasm"
          ),
        });
      } else {
        throw new Error(
          "Window is not defined. FFmpeg can only be loaded in a browser environment."
        );
      }
    };

    load();
  }, []);

  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto w-full max-w-8xl grow lg:flex">
        {/* Left sidebar */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6 bg-zinc-50 max-h-[540px] overflow-y-auto space-y-5">
            <div className="font-medium text-2xl">Generate Script</div>
            <form
              onSubmit={handleGenerateQuiz}
              className="flex flex-col space-y-5"
            >
              <div className="relative flex flex-col space-y-7">
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
                      height: "100px",
                    }}
                    placeholder="Example: Geography Quiz"
                  />
                </div>

                <div className="relative flex flex-col space-y-3">
                  <label
                    htmlFor="template-videos"
                    className="text-md font-medium"
                  >
                    Script
                  </label>
                  <div
                    id="template-videos"
                    className="relative flex flex-col space-y-3 max-h-[170px] overflow-y-auto border border-gray-300 rounded-md p-3"
                  >
                    {firstQuestion ? (
                      <>
                        <div className="relative flex flex-col space-y-3">
                          <div className="whitespace-pre">{firstQuestion}</div>
                          <div>Answer: {firstAnswer}</div>
                        </div>
                        <div className="relative flex flex-col space-y-3">
                          <div className="whitespace-pre">{secondQuestion}</div>
                          <div>Answer: {secondAnswer}</div>
                        </div>
                        <div className="relative flex flex-col space-y-3">
                          <div className="whitespace-pre">{thirdQuestion}</div>
                          <div>Answer: {thirdAnswer}</div>
                        </div>
                        <div className="relative flex flex-col space-y-3">
                          <div className="whitespace-pre">{fourthQuestion}</div>
                          <div>Answer: {fourthAnswer}</div>
                        </div>
                        <div className="relative flex flex-col space-y-3">
                          <div className="whitespace-pre">{fifthQuestion}</div>
                          <div>Answer: {fifthAnswer}</div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Ghost className="h-8 w-8 text-zinc-800" />
                        <h3 className="font-semibold text-lg">
                          Pretty empty around here
                        </h3>
                        <p>Let&apos;s generate you first quiz.</p>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isQuizScriptLoading}
                  variant="destructive"
                  className={
                    "bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition duration-300 ease-in-out"
                  }
                >
                  {isQuizScriptLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Generate Quiz"
                  )}
                </Button>
              </div>
            </form>
            <div className="font-medium text-2xl">Generate TTS</div>
            <form
              onSubmit={handleGenerateSpeech}
              className="flex flex-col space-y-5"
            >
              <div className="relative flex flex-col space-y-7">
                <div className="relative flex flex-col space-y-3">
                  <label
                    htmlFor="template-videos"
                    className="text-md font-medium"
                  >
                    Select a Voice
                  </label>
                  <div
                    id="template-videos"
                    className="relative flex flex-col space-y-3 max-h-[120px] overflow-y-auto border border-gray-300 rounded-md p-3"
                  >
                    <div
                      className={`template-container border rounded-md p-2 cursor-pointer flex items-center ${
                        voice === "alloy"
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                      onClick={() => setVoice("alloy")}
                    >
                      <div className="h-full flex font-medium text-md">
                        Alloy
                      </div>
                    </div>
                    <div
                      className={`template-container border rounded-md p-2 cursor-pointer flex items-center ${
                        voice === "echo" ? "border-blue-500" : "border-gray-300"
                      }`}
                      onClick={() => setVoice("echo")}
                    >
                      <div className="h-full flex font-medium text-md">
                        Echo
                      </div>
                    </div>
                    <div
                      className={`template-container border rounded-md p-2 cursor-pointer flex items-center ${
                        voice === "fable"
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                      onClick={() => setVoice("fable")}
                    >
                      <div className="h-full flex font-medium text-md">
                        Fable
                      </div>
                    </div>
                    <div
                      className={`template-container border rounded-md p-2 cursor-pointer flex items-center ${
                        voice === "onyx" ? "border-blue-500" : "border-gray-300"
                      }`}
                      onClick={() => setVoice("onyx")}
                    >
                      <div className="h-full flex font-medium text-md">
                        Onyx
                      </div>
                    </div>
                    <div
                      className={`template-container border rounded-md p-2 cursor-pointer flex items-center ${
                        voice === "nova" ? "border-blue-500" : "border-gray-300"
                      }`}
                      onClick={() => setVoice("nova")}
                    >
                      <div className="h-full flex font-medium text-md">
                        Nova
                      </div>
                    </div>
                    <div
                      className={`template-container border rounded-md p-2 cursor-pointer flex items-center ${
                        voice === "shimmer"
                          ? "border-blue-500"
                          : "border-gray-300"
                      }`}
                      onClick={() => setVoice("shimmer")}
                    >
                      <div className="h-full flex font-medium text-md">
                        Shimmer
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex flex-col space-y-3">
                  <label
                    htmlFor="text-to-speech"
                    className="text-md font-medium"
                  >
                    Text to Speech
                  </label>
                  <div
                    id="text-to-speech"
                    className="relative flex flex-col space-y-3 max-h-[170px] overflow-y-auto border border-gray-300 rounded-md p-3"
                  >
                    {firstSpeechDownload ? (
                      <div className="relative flex flex-col space-y-3">
                        <audio
                          src={firstSpeechDownload}
                          className="flex w-full"
                          controls
                        />
                        <audio
                          src={secondSpeechDownload}
                          className="flex w-full"
                          controls
                        />
                        <audio
                          src={thirdSpeechDownload}
                          className="flex w-full"
                          controls
                        />
                        <audio
                          src={fourthSpeechDownload}
                          className="flex w-full"
                          controls
                        />
                        <audio
                          src={fifthSpeechDownload}
                          className="flex w-full"
                          controls
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Ghost className="h-8 w-8 text-zinc-800" />
                        <h3 className="font-semibold text-lg">
                          Pretty empty around here
                        </h3>
                        <p>Let&apos;s generate your TTS.</p>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSpeechLoading}
                  variant="destructive"
                  className={
                    "bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition duration-300 ease-in-out"
                  }
                >
                  {isSpeechLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Generate Text to Speech"
                  )}
                </Button>
              </div>
            </form>
            <div className="font-medium text-2xl">Generate Video</div>
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
                  <div
                    className={`template-container border rounded-md p-2 cursor-pointer flex items-center ${
                      videoFile === "/templates/template1/video4.mp4"
                        ? "border-blue-500"
                        : "border-gray-300"
                    }`}
                    onClick={() =>
                      setVideoFile("/templates/template1/video4.mp4")
                    }
                  >
                    <div className="template-video bg-gray-200 rounded-sm">
                      <video
                        src="/templates/template1/video4.mp4"
                        className="w-20 h-12 p-1"
                      ></video>
                    </div>
                    <div className="template-info text-center flex-grow pl-3">
                      <div className="h-full flex font-medium text-md">
                        Video 4
                      </div>
                    </div>
                  </div>
                </div>

                <label htmlFor="video-status" className="text-md font-medium">
                  Video Status
                </label>
                <div
                  id="video-status"
                  className="relative flex flex-col space-y-3 overflow-y-auto border border-gray-300 rounded-md p-3  w-full h-28"
                >
                  <p ref={messageRef}></p>
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
          </div>
        </div>

        <div className="shrink-0 flex-[2] lg:w-96 flex justify-center items-center">
          <div className="max-h-[540px] overflow-y-auto">
            {transcodeFile ? (
              <div className="flex flex-col justify-center items-center space-y-6">
                <video
                  src={transcodeFile}
                  controls
                  style={{ maxWidth: "30%", maxHeight: "30%" }}
                />
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
