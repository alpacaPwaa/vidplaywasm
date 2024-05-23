"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { Button } from "../ui/button";
import { CheckCheck, Ghost, Loader2, Video } from "lucide-react";

export default function RiddleMeThisTemplate() {
  const [transcodeFile, setTranscodeFile] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState("/templates/template2/video4.mp4");
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

  const [firstRiddle, setFirstRiddle] = useState("");
  const [firstChoices, setFirstChoices] = useState("");
  const [firstAnswer, setFirstAnswer] = useState("");

  const [secondRiddle, setSecondRiddle] = useState("");
  const [secondChoices, setSecondChoices] = useState("");
  const [secondAnswer, setSecondAnswer] = useState("");

  const [thirdRiddle, setThirdRiddle] = useState("");
  const [thirdChoices, setThirdChoices] = useState("");
  const [thirdAnswer, setThirdAnswer] = useState("");

  const [fourthRiddle, setFourthRiddle] = useState("");
  const [fourthChoices, setFourthChoices] = useState("");
  const [fourthAnswer, setFourthAnswer] = useState("");

  const [fifthRiddle, setFifthRiddle] = useState("");
  const [fifthChoices, setFifthChoices] = useState("");
  const [fifthAnswer, setFifthAnswer] = useState("");

  const [promptText, setPromptText] = useState("");
  const [promtError, setPromptError] = useState("");

  const { data: userStatus, isLoading } = trpc.getUserPlanStatus.useQuery();

  const { mutate: generateRiddleScript, isLoading: isQuizScriptLoading } =
    trpc.generateRiddleScript.useMutation({
      onSuccess: async (data) => {
        const riddle1 = data.concatenatedFirstQuestion;
        const choices1 = data.firstChoices;
        const answer1 = data.firstAnswer;

        const riddle2 = data.concatenatedSecondQuestion;
        const choices2 = data.secondChoices;
        const answer2 = data.secondAnswer;

        const riddle3 = data.concatenatedThirdQuestion;
        const choices3 = data.thirdChoices;
        const answer3 = data.thirdAnswer;

        const riddle4 = data.concatenatedFourthQuestion;
        const choices4 = data.fourthChoices;
        const answer4 = data.fourthAnswer;

        const riddle5 = data.concatenatedFifthQuestion;
        const choices5 = data.fifthChoices;
        const answer5 = data.fifthAnswer;

        setFirstRiddle(riddle1);
        setFirstChoices(choices1);
        setFirstAnswer(answer1);

        setSecondRiddle(riddle2);
        setSecondChoices(choices2);
        setSecondAnswer(answer2);

        setThirdRiddle(riddle3);
        setThirdChoices(choices3);
        setThirdAnswer(answer3);

        setFourthRiddle(riddle4);
        setFourthChoices(choices4);
        setFourthAnswer(answer4);

        setFifthRiddle(riddle5);
        setFifthChoices(choices5);
        setFifthAnswer(answer5);

        console.log("First Question", riddle1);
        console.log("Second Question", riddle2);
        console.log("Third Question", riddle3);
        console.log("Fourth Question", riddle4);
        console.log("Fifth Question", riddle5);
      },
      onError: (error) => {
        console.error("Error Generating Quiz:", error);
      },
    });

  const { mutate: generateRiddleSpeech, isLoading: isSpeechLoading } =
    trpc.generateRiddleSpeech.useMutation({
      onSuccess: async (data) => {
        // Assuming data contains an array of speechURLs
        const [
          firstSpeechFile,
          secondSpeechFile,
          thirdSpeechFile,
          fourthSpeechFile,
          fifthSpeechFile,
        ] = data.speechURLs;

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
      generateRiddleScript({ prompt: promptText });
    } catch (error) {
      console.error("Error Generating Speech:", error);
      // Handle error gracefully, e.g., display an error message to the user
    }
  };

  const handleGenerateSpeech = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    // Create an array to hold the questions
    const questionsArray = [];

    // Push each question into the array if it is not empty
    if (firstRiddle.trim() !== "") {
      questionsArray.push(firstRiddle);
    }
    if (secondRiddle.trim() !== "") {
      questionsArray.push(secondRiddle);
    }
    if (thirdRiddle.trim() !== "") {
      questionsArray.push(thirdRiddle);
    }
    if (fourthRiddle.trim() !== "") {
      questionsArray.push(fourthRiddle);
    }
    if (fifthRiddle.trim() !== "") {
      questionsArray.push(fifthRiddle);
    }

    if (questionsArray.length === 0) {
      setfirstSpeechError("Please generate a quiz first");
      return; // Early return if no questions are present
    }

    console.log("clicked"); // Log before mutation

    try {
      generateRiddleSpeech({
        questions: questionsArray, // Pass the questionsArray to the mutation
        speechVoice: voice, // Assuming voice is defined elsewhere
      });
    } catch (error) {
      console.error("Error Generating Quiz:", error);
      // Handle error gracefully, e.g., display an error message to the user
    }
  };

  const handleChangePrompt = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptText(e.target.value);
  };

  const transcode = async () => {
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));
    // await ffmpeg.writeFile(
    //   "firstSpeechInput.mp3",
    //   await fetchFile(firstSpeechDownload)
    // );
    // await ffmpeg.writeFile(
    //   "secondSpeechInput.mp3",
    //   await fetchFile(secondSpeechDownload)
    // );
    await ffmpeg.writeFile(
      "Roboto-Regular.ttf",
      await fetchFile(
        "https://cdnjs.cloudflare.com/ajax/libs/materialize/0.98.1/fonts/roboto/Roboto-Bold.ttf"
      )
    );

    const fixedQuestionX = 2100;

    // Command for adding text overlay and speech file to the input video
    await ffmpeg.exec([
      "-i",
      "input.mp4",
      "-vf",
      `drawtext=fontfile=/Roboto-Regular.ttf:text='${firstRiddle}':x=(w-text_w)/2:y=(h-text_h)/4:fontsize=60:fontcolor=black:line_spacing=20:enable='between(t,5,13)',
      drawtext=fontfile=/Roboto-Regular.ttf:text='${firstChoices}':x=(w-text_w)/2:y=${fixedQuestionX}/2:fontsize=60:fontcolor=white:line_spacing=130:enable='between(t,5,13)',
      drawtext=fontfile=/Roboto-Regular.ttf:text='${firstAnswer}':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=60:fontcolor=white:line_spacing=20:enable='between(t,13,15)',
      drawtext=fontfile=/Roboto-Regular.ttf:text='${secondRiddle}':x=(w-text_w)/2:y=(h-text_h)/4:fontsize=60:fontcolor=black:line_spacing=20:enable='between(t,15,23)',
      drawtext=fontfile=/Roboto-Regular.ttf:text='${secondChoices}':x=(w-text_w)/2:y=${fixedQuestionX}/2:fontsize=60:fontcolor=white:line_spacing=130:enable='between(t,15,23)',
      drawtext=fontfile=/Roboto-Regular.ttf:text='${secondAnswer}':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=60:fontcolor=white:line_spacing=20:enable='between(t,23,25)',
      drawtext=fontfile=/Roboto-Regular.ttf:text='${thirdRiddle}':x=(w-text_w)/2:y=(h-text_h)/4:fontsize=60:fontcolor=black:line_spacing=20:enable='between(t,25,33)',
      drawtext=fontfile=/Roboto-Regular.ttf:text='${thirdChoices}':x=(w-text_w)/2:y=${fixedQuestionX}/2:fontsize=60:fontcolor=white:line_spacing=130:enable='between(t,25,33)',
      drawtext=fontfile=/Roboto-Regular.ttf:text='${thirdAnswer}':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=60:fontcolor=white:line_spacing=20:enable='between(t,33,35)',
      drawtext=fontfile=/Roboto-Regular.ttf:text='${fourthRiddle}':x=(w-text_w)/2:y=(h-text_h)/4:fontsize=60:fontcolor=black:line_spacing=20:enable='between(t,35,43)',
      drawtext=fontfile=/Roboto-Regular.ttf:text='${fourthChoices}':x=(w-text_w)/2:y=${fixedQuestionX}/2:fontsize=60:fontcolor=white:line_spacing=130:enable='between(t,35,43)',
      drawtext=fontfile=/Roboto-Regular.ttf:text='${fourthAnswer}':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=60:fontcolor=white:line_spacing=20:enable='between(t,43,45)',
      drawtext=fontfile=/Roboto-Regular.ttf:text='${fifthRiddle}':x=(w-text_w)/2:y=(h-text_h)/4:fontsize=60:fontcolor=black:line_spacing=20:enable='between(t,45,53)',
      drawtext=fontfile=/Roboto-Regular.ttf:text='${fifthChoices}':x=(w-text_w)/2:y=${fixedQuestionX}/2:fontsize=60:fontcolor=white:line_spacing=130:enable='between(t,45,53)',
      drawtext=fontfile=/Roboto-Regular.ttf:text='${fifthAnswer}':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=60:fontcolor=white:line_spacing=20:enable='between(t,53,55)'`,
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
    <div className="flex-1 justify-between flex flex-col">
      <div className="mx-auto w-full max-w-8xl grow lg:flex">
        {/* Left sidebar */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6 bg-zinc-50 h-[calc(100vh-3.5rem)] overflow-y-auto space-y-5">
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
                    placeholder="Example: A riddle about life, wisdom, and philosophy"
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
                    {firstRiddle ? (
                      <>
                        <div className="relative flex flex-col space-y-3">
                          <div className="whitespace-pre">{firstRiddle}</div>
                          <div className="whitespace-pre">{firstChoices}</div>
                          <div>Answer: {firstAnswer}</div>
                        </div>
                        <div className="relative flex flex-col space-y-3">
                          <div className="whitespace-pre">{secondRiddle}</div>
                          <div className="whitespace-pre">{secondChoices}</div>
                          <div>Answer: {secondAnswer}</div>
                        </div>
                        <div className="relative flex flex-col space-y-3">
                          <div className="whitespace-pre">{thirdRiddle}</div>
                          <div className="whitespace-pre">{thirdChoices}</div>
                          <div>Answer: {thirdAnswer}</div>
                        </div>
                        <div className="relative flex flex-col space-y-3">
                          <div className="whitespace-pre">{fourthRiddle}</div>
                          <div className="whitespace-pre">{fourthChoices}</div>
                          <div>Answer: {fourthAnswer}</div>
                        </div>
                        <div className="relative flex flex-col space-y-3">
                          <div className="whitespace-pre">{fifthRiddle}</div>
                          <div className="whitespace-pre">{fifthChoices}</div>
                          <div>Answer: {fifthAnswer}</div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Ghost className="h-8 w-8 text-zinc-800" />
                        <h3 className="font-semibold text-lg">
                          Pretty empty around here
                        </h3>
                        <p>Let&apos;s generate you first riddle.</p>
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
                    "Generate Riddle"
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
                    className="relative flex flex-col space-y-3 max-h-[175px] overflow-y-auto border border-gray-300 rounded-md p-3"
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

                {firstSpeechDownload && (
                  <div
                    id="text-to-speech"
                    className="flex bg-green-500 rounded-md p-3"
                  >
                    <div className="flex align-middle space-x-3">
                      <CheckCheck />
                      <div className="font-medium text-md">
                        Text to speech generated successfully
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled
                  variant="destructive"
                  className={
                    "bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition duration-300 ease-in-out"
                  }
                >
                  {isSpeechLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Text to Speech Coming Soon"
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
                      videoFile === "/templates/template2/video4.mp4"
                        ? "border-blue-500"
                        : "border-gray-300"
                    }`}
                    onClick={() =>
                      setVideoFile("/templates/template2/video4.mp4")
                    }
                  >
                    <div className="template-video bg-gray-200 rounded-sm">
                      <video
                        src="/templates/template2/video4t.mp4"
                        className="w-20 h-12 p-1"
                      ></video>
                    </div>
                    <div className="template-info text-center flex-grow pl-3">
                      <div className="h-full flex font-medium text-md">
                        Tiktok
                      </div>
                    </div>
                  </div>
                  <div
                    className={`template-container border rounded-md p-2 cursor-pointer flex items-center ${
                      videoFile === "/templates/template2/video8.mp4"
                        ? "border-blue-500"
                        : "border-gray-300"
                    }`}
                    onClick={() =>
                      setVideoFile("/templates/template2/video8.mp4")
                    }
                  >
                    <div className="template-video bg-gray-200 rounded-sm">
                      <video
                        src="/templates/template2/video8.mp4"
                        className="w-20 h-12 p-1"
                      ></video>
                    </div>
                    <div className="template-info text-center flex-grow pl-3">
                      <div className="h-full flex font-medium text-md">
                        Yellow
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

              <Button
                onClick={transcode}
                disabled={userStatus?.status === "FREE"}
                className={
                  "bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition duration-300 ease-in-out"
                }
              >
                {userStatus?.status === "FREE" ? (
                  <div>Activate Your Account</div>
                ) : (
                  <div>Generate Riddle</div>
                )}
              </Button>
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
              <div className="flex flex-col items-center gap-2">
                <Video className="h-8 w-8 text-zinc-800" />
                <h3 className="font-semibold text-lg">
                  Pretty empty around here
                </h3>
                <p>Let&apos;s generate you first video.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
