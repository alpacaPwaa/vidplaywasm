import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import OpenAI from "openai";
import { db } from "@/db";
import { z } from "zod";

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

      return {
        firstQuestionText,
        joinedFirstQuestionAndChoices,
        firstAnswer,
      };
    }),
});

export type AppRouter = typeof appRouter;
