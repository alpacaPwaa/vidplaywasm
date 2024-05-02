import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import OpenAI from "openai";
import { db } from "@/db";
import { z } from "zod";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import crypto from "crypto";
import { PassThrough } from "stream";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id || !user.email)
      throw new TRPCError({ code: "UNAUTHORIZED" });

    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
    }

    return { success: true };
  }),

  generateQuizScript: privateProcedure
    .input(
      z.object({
        promt: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const maxLength = 5;
      const secondMaxLength = 10;

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const allQuestion = await openai.completions.create({
        model: "gpt-3.5-turbo-instruct",
        prompt:
          "Write 1 general knowledge quiz with 4 choices and answer about " +
          input.promt +
          " Always start with keyword Question:, example Question: question. Then the choices, A, B, C, and D. Lastly, the correct answer which always must begin with the keyword Answer:, then the correct answer, example: Answer. A. Correct Answer",
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        n: 5,
        frequency_penalty: 1,
        presence_penalty: 1,
      });

      console.log(allQuestion);

      const firstQuestionText = allQuestion.choices[0].text;

      const firstQuestionMatch = firstQuestionText.match(
        /Question:([\s\S]+?)\n[A-D]\. /
      );
      const firstQuestion = firstQuestionMatch
        ? firstQuestionMatch[1].trim()
        : "";

      const firstQuestionWords = firstQuestion.split(" ");
      let firstQuestionWordCount = firstQuestionWords.length;

      let concatenatedFirstQuestion = "";

      if (firstQuestionWordCount > secondMaxLength) {
        concatenatedFirstQuestion = firstQuestionWords
          .slice(0, maxLength)
          .join(" ");
        concatenatedFirstQuestion +=
          "\n" + firstQuestionWords.slice(maxLength, secondMaxLength).join(" ");
        concatenatedFirstQuestion +=
          "\n" + firstQuestionWords.slice(secondMaxLength).join(" ");
      } else if (firstQuestionWordCount > maxLength) {
        concatenatedFirstQuestion = firstQuestionWords
          .slice(0, maxLength)
          .join(" ");
        concatenatedFirstQuestion +=
          "\n" + firstQuestionWords.slice(maxLength).join(" ");
      } else {
        concatenatedFirstQuestion = firstQuestion;
      }

      console.log("Question:", concatenatedFirstQuestion);

      const firstChoicesRegex =
        /[A-D]\. (?!\b[A-D]\.|\nAnswer:\s)(.+?)(?=\n|$)/gs;
      const firstChoicesMatch = firstQuestionText.match(firstChoicesRegex);
      const firstChoicesFilter = firstChoicesMatch
        ? firstChoicesMatch
            .filter((choice) => choice.trim())
            .slice(0, 4)
            .map((choice) => choice.trim())
        : [];

      const firstChoices = firstChoicesFilter.join("\n");

      console.log("Choices:", firstChoices);

      const joinedFirstQuestionAndChoices =
        concatenatedFirstQuestion + "\n\n" + firstChoices;

      console.log("Question and Choices:", joinedFirstQuestionAndChoices);

      const firstAnswerMatch = firstQuestionText.match(/Answer: ([A-D]\. .+)/);
      const firstAnswer = firstAnswerMatch ? firstAnswerMatch[1].trim() : "";

      console.log("Answer:", firstAnswer);

      //Second Question

      const secondQuestionText = allQuestion.choices[1].text;

      const secondQuestionMatch = secondQuestionText.match(
        /Question:([\s\S]+?)\n[A-D]\. /
      );
      const secondQuestion = secondQuestionMatch
        ? secondQuestionMatch[1].trim()
        : "";

      const secondQuestionWords = secondQuestion.split(" ");
      let secondQuestionWordCount = secondQuestionWords.length;

      let concatenatedSecondQuestion = "";

      if (secondQuestionWordCount > secondMaxLength) {
        concatenatedSecondQuestion = secondQuestionWords
          .slice(0, maxLength)
          .join(" ");
        concatenatedSecondQuestion +=
          "\n" +
          secondQuestionWords.slice(maxLength, secondMaxLength).join(" ");
        concatenatedSecondQuestion +=
          "\n" + secondQuestionWords.slice(secondMaxLength).join(" ");
      } else if (secondQuestionWordCount > maxLength) {
        concatenatedSecondQuestion = secondQuestionWords
          .slice(0, maxLength)
          .join(" ");
        concatenatedSecondQuestion +=
          "\n" + secondQuestionWords.slice(maxLength).join(" ");
      } else {
        concatenatedSecondQuestion = secondQuestion;
      }

      console.log("Question:", concatenatedSecondQuestion);

      const secondChoicesRegex =
        /[A-D]\. (?!\b[A-D]\.|\nAnswer:\s)(.+?)(?=\n|$)/gs;
      const secondChoicesMatch = secondQuestionText.match(secondChoicesRegex);
      const secondChoicesFilter = secondChoicesMatch
        ? secondChoicesMatch
            .filter((choice) => choice.trim())
            .slice(0, 4)
            .map((choice) => choice.trim())
        : [];

      const secondChoices = secondChoicesFilter.join("\n");

      console.log("Choices:", secondChoices);

      const joinedSecondQuestionAndChoices =
        concatenatedSecondQuestion + "\n\n" + secondChoices;

      console.log("Question and Choices:", joinedSecondQuestionAndChoices);

      const secondAnswerMatch =
        secondQuestionText.match(/Answer: ([A-D]\. .+)/);
      const secondAnswer = secondAnswerMatch ? secondAnswerMatch[1].trim() : "";

      console.log("Answer:", secondAnswer);

      //Third Question

      const thirdQuestionText = allQuestion.choices[2].text;

      const thirdQuestionMatch = thirdQuestionText.match(
        /Question:([\s\S]+?)\n[A-D]\. /
      );
      const thirdQuestion = thirdQuestionMatch
        ? thirdQuestionMatch[1].trim()
        : "";

      const thirdQuestionWords = thirdQuestion.split(" ");
      let thirdQuestionWordCount = thirdQuestionWords.length;

      let concatenatedThirdQuestion = "";

      if (thirdQuestionWordCount > secondMaxLength) {
        concatenatedThirdQuestion = thirdQuestionWords
          .slice(0, maxLength)
          .join(" ");
        concatenatedThirdQuestion +=
          "\n" + thirdQuestionWords.slice(maxLength, secondMaxLength).join(" ");
        concatenatedThirdQuestion +=
          "\n" + thirdQuestionWords.slice(secondMaxLength).join(" ");
      } else if (thirdQuestionWordCount > maxLength) {
        concatenatedThirdQuestion = thirdQuestionWords
          .slice(0, maxLength)
          .join(" ");
        concatenatedThirdQuestion +=
          "\n" + thirdQuestionWords.slice(maxLength).join(" ");
      } else {
        concatenatedThirdQuestion = thirdQuestion;
      }

      console.log("Question:", concatenatedThirdQuestion);

      const thirdChoicesRegex =
        /[A-D]\. (?!\b[A-D]\.|\nAnswer:\s)(.+?)(?=\n|$)/gs;
      const thirdChoicesMatch = thirdQuestionText.match(thirdChoicesRegex);
      const thirdChoicesFilter = thirdChoicesMatch
        ? thirdChoicesMatch
            .filter((choice) => choice.trim())
            .slice(0, 4)
            .map((choice) => choice.trim())
        : [];

      const thirdChoices = thirdChoicesFilter.join("\n");

      console.log("Choices:", thirdChoices);

      const joinedThirdQuestionAndChoices =
        concatenatedThirdQuestion + "\n\n" + thirdChoices;

      console.log("Question and Choices:", joinedThirdQuestionAndChoices);

      const thirdAnswerMatch = thirdQuestionText.match(/Answer: ([A-D]\. .+)/);
      const thirdAnswer = thirdAnswerMatch ? thirdAnswerMatch[1].trim() : "";

      console.log("Answer:", thirdAnswer);

      //Fourth Question

      const fourthQuestionText = allQuestion.choices[3].text;

      const fourthQuestionMatch = fourthQuestionText.match(
        /Question:([\s\S]+?)\n[A-D]\. /
      );
      const fourthQuestion = fourthQuestionMatch
        ? fourthQuestionMatch[1].trim()
        : "";

      const fourthQuestionWords = fourthQuestion.split(" ");
      let fourthQuestionWordCount = fourthQuestionWords.length;

      let concatenatedFourthQuestion = "";

      if (fourthQuestionWordCount > secondMaxLength) {
        concatenatedFourthQuestion = fourthQuestionWords
          .slice(0, maxLength)
          .join(" ");
        concatenatedFourthQuestion +=
          "\n" +
          fourthQuestionWords.slice(maxLength, secondMaxLength).join(" ");
        concatenatedFourthQuestion +=
          "\n" + fourthQuestionWords.slice(secondMaxLength).join(" ");
      } else if (fourthQuestionWordCount > maxLength) {
        concatenatedFourthQuestion = fourthQuestionWords
          .slice(0, maxLength)
          .join(" ");
        concatenatedFourthQuestion +=
          "\n" + fourthQuestionWords.slice(maxLength).join(" ");
      } else {
        concatenatedFourthQuestion = fourthQuestion;
      }

      console.log("Question:", concatenatedFourthQuestion);

      const fourthChoicesRegex =
        /[A-D]\. (?!\b[A-D]\.|\nAnswer:\s)(.+?)(?=\n|$)/gs;
      const fourthChoicesMatch = fourthQuestionText.match(fourthChoicesRegex);
      const fourthChoicesFilter = fourthChoicesMatch
        ? fourthChoicesMatch
            .filter((choice) => choice.trim())
            .slice(0, 4)
            .map((choice) => choice.trim())
        : [];

      const fourthChoices = fourthChoicesFilter.join("\n");

      console.log("Choices:", fourthChoices);

      const joinedFourthQuestionAndChoices =
        concatenatedFourthQuestion + "\n\n" + fourthChoices;

      console.log("Question and Choices:", joinedFourthQuestionAndChoices);

      const fourthAnswerMatch =
        fourthQuestionText.match(/Answer: ([A-D]\. .+)/);
      const fourthAnswer = fourthAnswerMatch ? fourthAnswerMatch[1].trim() : "";

      console.log("Answer:", fourthAnswer);

      //Fifth Question

      const fifthQuestionText = allQuestion.choices[4].text;

      const fifthQuestionMatch = fifthQuestionText.match(
        /Question:([\s\S]+?)\n[A-D]\. /
      );
      const fifthQuestion = fifthQuestionMatch
        ? fifthQuestionMatch[1].trim()
        : "";

      const fifthQuestionWords = fifthQuestion.split(" ");
      let fifthQuestionWordCount = fifthQuestionWords.length;

      let concatenatedFifthQuestion = "";

      if (fifthQuestionWordCount > secondMaxLength) {
        concatenatedFifthQuestion = fifthQuestionWords
          .slice(0, maxLength)
          .join(" ");
        concatenatedFifthQuestion +=
          "\n" + fifthQuestionWords.slice(maxLength, secondMaxLength).join(" ");
        concatenatedFifthQuestion +=
          "\n" + fifthQuestionWords.slice(secondMaxLength).join(" ");
      } else if (fifthQuestionWordCount > maxLength) {
        concatenatedFifthQuestion = fifthQuestionWords
          .slice(0, maxLength)
          .join(" ");
        concatenatedFifthQuestion +=
          "\n" + fifthQuestionWords.slice(maxLength).join(" ");
      } else {
        concatenatedFifthQuestion = fifthQuestion;
      }

      console.log("Question:", concatenatedFifthQuestion);

      const fifthChoicesRegex =
        /[A-D]\. (?!\b[A-D]\.|\nAnswer:\s)(.+?)(?=\n|$)/gs;
      const fifthChoicesMatch = fifthQuestionText.match(fifthChoicesRegex);
      const fifthChoicesFilter = fifthChoicesMatch
        ? fifthChoicesMatch
            .filter((choice) => choice.trim())
            .slice(0, 4)
            .map((choice) => choice.trim())
        : [];

      const fifthChoices = fifthChoicesFilter.join("\n");

      console.log("Choices:", fifthChoices);

      const joinedFifthQuestionAndChoices =
        concatenatedFifthQuestion + "\n\n" + fifthChoices;

      console.log("Question and Choices:", joinedFifthQuestionAndChoices);

      const fifthAnswerMatch = fifthQuestionText.match(/Answer: ([A-D]\. .+)/);
      const fifthAnswer = fifthAnswerMatch ? fifthAnswerMatch[1].trim() : "";

      console.log("Answer:", fifthAnswer);
      return {
        firstQuestion,
        joinedFirstQuestionAndChoices,
        firstAnswer,

        secondQuestion,
        joinedSecondQuestionAndChoices,
        secondAnswer,

        thirdQuestion,
        joinedThirdQuestionAndChoices,
        thirdAnswer,

        fourthQuestion,
        joinedFourthQuestionAndChoices,
        fourthAnswer,

        fifthQuestion,
        joinedFifthQuestionAndChoices,
        fifthAnswer,
      };
    }),

  generateQuizSpeech: privateProcedure
    .input(
      z.object({
        speechVoice: z.enum([
          "alloy",
          "echo",
          "fable",
          "onyx",
          "nova",
          "shimmer",
        ]),
        firstQuestion: z.string(),
        secondQuestion: z.string(),
        thirdQuestion: z.string(),
        fourthQuestion: z.string(),
        fifthQuestion: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const s3 = new S3Client({
        region: process.env.AWS_BUCKET_REGION!,
        credentials: {
          accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });

      const generateFirstFileName = (bytes = 32) =>
        crypto.randomBytes(bytes).toString("hex");

      const firstSpeechURL = generateFirstFileName();

      const putFirstObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: firstSpeechURL,
      });

      const firstSingedURL = await getSignedUrl(s3, putFirstObjectCommand, {
        expiresIn: 60,
      });

      const firstQuestionSpeech = await openai.audio.speech.create({
        model: "tts-1",
        voice: input.speechVoice,
        input: input.firstQuestion,
      });

      const firstQuestionBuffer = Buffer.from(
        await firstQuestionSpeech.arrayBuffer()
      );

      const uploadFirstSpeechToS3 = async (stream: PassThrough) => {
        const upload = new Upload({
          client: s3,
          params: {
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: firstSpeechURL,
            Body: stream,
            ContentType: "audio/mpeg",
          },
        });
        await upload.done();
      };

      const passThroughStreamFirstSpeeh = new PassThrough();
      passThroughStreamFirstSpeeh.write(firstQuestionBuffer);
      passThroughStreamFirstSpeeh.end();

      await uploadFirstSpeechToS3(passThroughStreamFirstSpeeh);

      console.log(
        `Uploaded TTS audio to S3: s3://${process.env
          .AWS_BUCKET_NAME!}/${generateFirstFileName()}`
      );

      //Second Speech

      const generateSecondFileName = (bytes = 32) =>
        crypto.randomBytes(bytes).toString("hex");

      const secondSpeechURL = generateSecondFileName();

      const putSecondObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: secondSpeechURL,
      });

      const secondSingedURL = await getSignedUrl(s3, putSecondObjectCommand, {
        expiresIn: 60,
      });

      const secondQuestionSpeech = await openai.audio.speech.create({
        model: "tts-1",
        voice: input.speechVoice,
        input: input.secondQuestion,
      });

      const secondQuestionBuffer = Buffer.from(
        await secondQuestionSpeech.arrayBuffer()
      );

      const uploadSecondSpeechToS3 = async (stream: PassThrough) => {
        const upload = new Upload({
          client: s3,
          params: {
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: secondSpeechURL,
            Body: stream,
            ContentType: "audio/mpeg",
          },
        });
        await upload.done();
      };

      const passThroughStreamSecondSpeeh = new PassThrough();
      passThroughStreamSecondSpeeh.write(secondQuestionBuffer);
      passThroughStreamSecondSpeeh.end();

      await uploadSecondSpeechToS3(passThroughStreamSecondSpeeh);

      console.log(
        `Uploaded TTS audio to S3: s3://${process.env
          .AWS_BUCKET_NAME!}/${generateSecondFileName()}`
      );

      //Third Speech

      const generateThirdFileName = (bytes = 32) =>
        crypto.randomBytes(bytes).toString("hex");

      const thirdSpeechURL = generateThirdFileName();

      const putThirdObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: thirdSpeechURL,
      });

      const thirdSingedURL = await getSignedUrl(s3, putThirdObjectCommand, {
        expiresIn: 60,
      });

      const thirdQuestionSpeech = await openai.audio.speech.create({
        model: "tts-1",
        voice: input.speechVoice,
        input: input.thirdQuestion,
      });

      const thirdQuestionBuffer = Buffer.from(
        await thirdQuestionSpeech.arrayBuffer()
      );

      const uploadThirdSpeechToS3 = async (stream: PassThrough) => {
        const upload = new Upload({
          client: s3,
          params: {
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: thirdSpeechURL,
            Body: stream,
            ContentType: "audio/mpeg",
          },
        });
        await upload.done();
      };

      const passThroughStreamThirdSpeech = new PassThrough();
      passThroughStreamThirdSpeech.write(thirdQuestionBuffer);
      passThroughStreamThirdSpeech.end();

      await uploadThirdSpeechToS3(passThroughStreamThirdSpeech);

      console.log(
        `Uploaded TTS audio to S3: s3://${process.env
          .AWS_BUCKET_NAME!}/${generateThirdFileName()}`
      );

      //Fourth Speech

      const generateFourthFileName = (bytes = 32) =>
        crypto.randomBytes(bytes).toString("hex");

      const fourthSpeechURL = generateFourthFileName();

      const putFourthObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fourthSpeechURL,
      });

      const fourthSingedURL = await getSignedUrl(s3, putFourthObjectCommand, {
        expiresIn: 60,
      });

      const fourthQuestionSpeech = await openai.audio.speech.create({
        model: "tts-1",
        voice: input.speechVoice,
        input: input.fourthQuestion,
      });

      const fourthQuestionBuffer = Buffer.from(
        await fourthQuestionSpeech.arrayBuffer()
      );

      const uploadFourthSpeechToS3 = async (stream: PassThrough) => {
        const upload = new Upload({
          client: s3,
          params: {
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: fourthSpeechURL,
            Body: stream,
            ContentType: "audio/mpeg",
          },
        });
        await upload.done();
      };

      const passThroughStreamFourthSpeech = new PassThrough();
      passThroughStreamFourthSpeech.write(fourthQuestionBuffer);
      passThroughStreamFourthSpeech.end();

      await uploadFourthSpeechToS3(passThroughStreamFourthSpeech);

      console.log(
        `Uploaded TTS audio to S3: s3://${process.env
          .AWS_BUCKET_NAME!}/${generateFourthFileName()}`
      );

      //Fifth Speech

      const generateFifthFileName = (bytes = 32) =>
        crypto.randomBytes(bytes).toString("hex");

      const fifthSpeechURL = generateFifthFileName();

      const putFifthObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fifthSpeechURL,
      });

      const fifthSingedURL = await getSignedUrl(s3, putFifthObjectCommand, {
        expiresIn: 60,
      });

      const fifthQuestionSpeech = await openai.audio.speech.create({
        model: "tts-1",
        voice: input.speechVoice,
        input: input.fifthQuestion,
      });

      const fifthQuestionBuffer = Buffer.from(
        await fifthQuestionSpeech.arrayBuffer()
      );

      const uploadFifthSpeechToS3 = async (stream: PassThrough) => {
        const upload = new Upload({
          client: s3,
          params: {
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: fifthSpeechURL,
            Body: stream,
            ContentType: "audio/mpeg",
          },
        });
        await upload.done();
      };

      const passThroughStreamFifthSpeech = new PassThrough();
      passThroughStreamFifthSpeech.write(fifthQuestionBuffer);
      passThroughStreamFifthSpeech.end();

      await uploadFifthSpeechToS3(passThroughStreamFifthSpeech);

      console.log(
        `Uploaded TTS audio to S3: s3://${process.env
          .AWS_BUCKET_NAME!}/${generateFifthFileName()}`
      );

      return {
        firstSpeech: firstSingedURL.split("?")[0],
        secondSpeech: secondSingedURL.split("?")[0],
        thirdSpeech: thirdSingedURL.split("?")[0],
        fourthSpeech: fourthSingedURL.split("?")[0],
        fifthSpeech: fifthSingedURL.split("?")[0],
      };
    }),
});

export type AppRouter = typeof appRouter;
