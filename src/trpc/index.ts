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
          "Write 1 general knowledge quiz with 4 choices and answer about " +
          input.prompt +
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

      let concatenatedFirstQuestion = firstQuestion.replace(
        regexPattern,
        "$&\n"
      );

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

      let concatenatedSecondQuestion = secondQuestion.replace(
        regexPattern,
        "$&\n"
      );

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

      let concatenatedThirdQuestion = thirdQuestion.replace(
        regexPattern,
        "$&\n"
      );

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

      let concatenatedFourthQuestion = fourthQuestion.replace(
        regexPattern,
        "$&\n"
      );

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

      let concatenatedFifthQuestion = fifthQuestion.replace(
        regexPattern,
        "$&\n"
      );

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

      const fifthAnswerMatch = fifthQuestionText.match(/Answer: ([A-D]\. .+)/);
      const fifthAnswer = fifthAnswerMatch ? fifthAnswerMatch[1].trim() : "";

      console.log("Answer:", fifthAnswer);
      return {
        concatenatedFirstQuestion,
        firstChoices,
        firstAnswer,

        concatenatedSecondQuestion,
        secondChoices,
        secondAnswer,

        concatenatedThirdQuestion,
        thirdChoices,
        thirdAnswer,

        concatenatedFourthQuestion,
        fourthChoices,
        fourthAnswer,

        concatenatedFifthQuestion,
        fifthChoices,
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

        const questionSpeech = await openai.audio.speech.create({
          model: "tts-1",
          voice: input.speechVoice,
          input: question,
        });

        const questionBuffer = Buffer.from(await questionSpeech.arrayBuffer());

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

      const speechURLs = [];
      for (let i = 0; i < input.questions.length; i++) {
        const question = input.questions[i];
        const speechURL = await uploadSpeechToS3(question, i + 1);
        speechURLs.push(speechURL);
      }

      return { speechURLs };
    }),
});

export type AppRouter = typeof appRouter;
