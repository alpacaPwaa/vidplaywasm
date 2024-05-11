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

  updateUserPlan: privateProcedure.query(async () => {
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
      await db.user.update({
        data: {
          userPlan: "PRO",
        },
        where: {
          id: user.id,
        },
      });
    }

    return { success: true };
  }),

  getUserPlanStatus: privateProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id || !user.email)
      throw new TRPCError({ code: "UNAUTHORIZED" });

    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    return { status: dbUser?.userPlan };
  }),

  generateQuizScript: privateProcedure
    .input(
      z.object({
        prompt: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const regexPattern = /.{1,28}(?:\s+|$)|\n/g;
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const allQuestion = await openai.completions.create({
        model: "gpt-3.5-turbo-instruct",
        prompt:
          "Write 1 general knowledge quiz with 4 choices and answer. Keep the question short and simple. " +
          input.prompt +
          " Avoid duplicate questions. Always start with keyword Question:, example Question: question. Then the choices, A, B, C, and D. Lastly, the correct answer which always must begin with the keyword Answer:, then the correct answer, example: Answer. A. Correct Answer.",
        temperature: 1,
        max_tokens: 256,
        n: 5,
        frequency_penalty: 1,
        presence_penalty: 1,
      });

      console.log(allQuestion);

      const processQuestion = (questionText: string) => {
        const questionMatch = questionText.match(
          /Question:([\s\S]+?)\n[A-D]\. /
        );

        const question = questionMatch
          ? questionMatch[1]
              .trim()
              .replace(regexPattern, "$&\n")
              .replace(/[\\\%\'\:]+/g, " ")
          : "";

        console.log("Question:", question);

        const choicesRegex = /[A-D]\. (?!\b[A-D]\.|\nAnswer:\s)(.+?)(?=\n|$)/gs;
        const choicesMatch = questionText.match(choicesRegex);
        const choices = choicesMatch
          ? choicesMatch
              .filter((choice) => choice.trim())
              .slice(0, 4)
              .map((choice) => choice.trim())
              .join("\n")
              .replace(/[\\\%\'\:]+/g, " ")
          : "";

        console.log("Choices:", choices);

        const answerMatch = questionText.match(/Answer: ([A-D]\. .+)/);
        const answer = answerMatch ? answerMatch[1].trim() : "";

        console.log("Answer:", answer);

        return { question, choices, answer };
      };

      const questions = allQuestion.choices.map((choice) =>
        processQuestion(choice.text)
      );

      const quizResult = {
        concatenatedFirstQuestion: questions[0].question,
        firstChoices: questions[0].choices,
        firstAnswer: questions[0].answer,
        concatenatedSecondQuestion: questions[1].question,
        secondChoices: questions[1].choices,
        secondAnswer: questions[1].answer,
        concatenatedThirdQuestion: questions[2].question,
        thirdChoices: questions[2].choices,
        thirdAnswer: questions[2].answer,
        concatenatedFourthQuestion: questions[3].question,
        fourthChoices: questions[3].choices,
        fourthAnswer: questions[3].answer,
        concatenatedFifthQuestion: questions[4].question,
        fifthChoices: questions[4].choices,
        fifthAnswer: questions[4].answer,
      };

      return quizResult;
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
        questions: z.array(z.string()), // Array of questions
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

      const generateFileName = (bytes = 32) =>
        crypto.randomBytes(bytes).toString("hex");

      const uploadSpeechToS3 = async (
        question: string,
        questionNumber: number
      ) => {
        const speechURL = generateFileName();
        const putObjectCommand = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: speechURL,
        });
        const signedURL = await getSignedUrl(s3, putObjectCommand, {
          expiresIn: 60,
        });

        const questionSpeech = openai.audio.speech.create({
          model: "tts-1",
          voice: input.speechVoice,
          input: question,
        });

        const questionBuffer = Buffer.from(
          await (await questionSpeech).arrayBuffer()
        );

        const passThroughStream = new PassThrough();
        passThroughStream.write(questionBuffer);
        passThroughStream.end();

        const upload = new Upload({
          client: s3,
          params: {
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: speechURL,
            Body: passThroughStream,
            ContentType: "audio/mpeg",
          },
        });
        await upload.done();

        console.log(
          `Uploaded TTS audio to S3: s3://${process.env
            .AWS_BUCKET_NAME!}/${speechURL}`
        );

        return signedURL.split("?")[0];
      };

      // Using Promise.all to run all uploads concurrently
      const uploadPromises = input.questions.map((question, i) =>
        uploadSpeechToS3(question, i + 1)
      );
      const speechURLs = await Promise.all(uploadPromises);

      return { speechURLs };
    }),

  generateRiddleScript: privateProcedure
    .input(
      z.object({
        prompt: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const regexPattern = /.{1,28}(?:\s+|$)|\n/g;
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const allQuestion = await openai.completions.create({
        model: "gpt-3.5-turbo-instruct",
        prompt:
          "Write 1 riddle with 4 choices and the correct answer. " +
          input.prompt +
          " Always start with keyword Riddle:, example Riddle: question. Then the choices, A, B, C, and D. Lastly, the correct answer which always must begin with the keyword Answer:, then the correct answer, example: Answer. A. Correct Answer.",
        temperature: 1, // Experiment with temperature for desired creativity
        max_tokens: 256,
        n: 5,
      });

      console.log(allQuestion);

      const processQuestion = (questionText: string) => {
        const questionMatch = questionText.match(/Riddle:([\s\S]+?)\n[A-D]\. /);

        const question = questionMatch
          ? questionMatch[1]
              .trim()
              .replace(regexPattern, "$&\n")
              .replace(/[\\\%\'\:]+/g, " ")
          : "";

        console.log("Question:", question);

        const choicesRegex = /[A-D]\. (?!\b[A-D]\.|\nAnswer:\s)(.+?)(?=\n|$)/gs;
        const choicesMatch = questionText.match(choicesRegex);
        const choices = choicesMatch
          ? choicesMatch
              .filter((choice) => choice.trim())
              .slice(0, 4)
              .map((choice) => choice.trim())
              .join("\n")
              .replace(/[\\\%\'\:]+/g, " ")
          : "";

        console.log("Choices:", choices);

        const answerMatch = questionText.match(/Answer: ([A-D]\. .+)/);
        const answer = answerMatch ? answerMatch[1].trim() : "";

        console.log("Answer:", answer);

        return { question, choices, answer };
      };

      const questions = allQuestion.choices.map((choice) =>
        processQuestion(choice.text)
      );

      const quizResult = {
        concatenatedFirstQuestion: questions[0].question,
        firstChoices: questions[0].choices,
        firstAnswer: questions[0].answer,
        concatenatedSecondQuestion: questions[1].question,
        secondChoices: questions[1].choices,
        secondAnswer: questions[1].answer,
        concatenatedThirdQuestion: questions[2].question,
        thirdChoices: questions[2].choices,
        thirdAnswer: questions[2].answer,
        concatenatedFourthQuestion: questions[3].question,
        fourthChoices: questions[3].choices,
        fourthAnswer: questions[3].answer,
        concatenatedFifthQuestion: questions[4].question,
        fifthChoices: questions[4].choices,
        fifthAnswer: questions[4].answer,
      };

      return quizResult;
    }),

  generateRiddleSpeech: privateProcedure
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
        questions: z.array(z.string()), // Array of questions
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

      const generateFileName = (bytes = 32) =>
        crypto.randomBytes(bytes).toString("hex");

      const uploadSpeechToS3 = async (
        question: string,
        questionNumber: number
      ) => {
        const speechURL = generateFileName();
        const putObjectCommand = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: speechURL,
        });
        const signedURL = await getSignedUrl(s3, putObjectCommand, {
          expiresIn: 60,
        });

        const questionSpeech = openai.audio.speech.create({
          model: "tts-1",
          voice: input.speechVoice,
          input: question,
        });

        const questionBuffer = Buffer.from(
          await (await questionSpeech).arrayBuffer()
        );

        const passThroughStream = new PassThrough();
        passThroughStream.write(questionBuffer);
        passThroughStream.end();

        const upload = new Upload({
          client: s3,
          params: {
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: speechURL,
            Body: passThroughStream,
            ContentType: "audio/mpeg",
          },
        });
        await upload.done();

        console.log(
          `Uploaded TTS audio to S3: s3://${process.env
            .AWS_BUCKET_NAME!}/${speechURL}`
        );

        return signedURL.split("?")[0];
      };

      // Using Promise.all to run all uploads concurrently
      const uploadPromises = input.questions.map((question, i) =>
        uploadSpeechToS3(question, i + 1)
      );
      const speechURLs = await Promise.all(uploadPromises);

      return { speechURLs };
    }),
});

export type AppRouter = typeof appRouter;
