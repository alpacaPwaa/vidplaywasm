import MaxWidthWrapper from "@/components/MaxWidthWrapper";

const Page = () => {
  return (
    <>
      <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-medium text-blue-600 mb-8">About Us</span>
        <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
          Unleash Limitless <span className="text-blue-600">Creativity</span>{" "}
          Instantly.
        </h1>
        <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
          Welcome to the Ultimate AI Platform for Short Form Content Creation!
          With Tumndig, you can effortlessly generate engaging mini-games like
          riddles, quizzes, Q&A, and more in seconds.
        </p>
      </MaxWidthWrapper>

      <div className="mx-auto mb-32 mt-16 max-w-5xl sm:mt-16">
        <div className="mb-12 px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="mt-2 font-bold text-4xl text-gray-900 sm:text-5xl">
              Our Mission
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              At Tumndig, we&apos;re dedicated to revolutionizing content
              creation by providing innovative tools that empower creators to
              effortlessly craft high-quality mini-games for their social media
              platforms. Our mission is to transform content creation into a
              delightful and interactive experience for all, ensuring that every
              creator can unleash their creativity and engage their audience
              like never before.
            </p>
          </div>
        </div>

        {/* steps */}
        <ol className="my-8 space-y-4 pt-8 md:flex md:space-x-12 md:space-y-0">
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-xl font-semibold">
                Easy-to-Use Interface
              </span>
              <span className="mt-2 text-zinc-700">
                Our platform features an intuitive interface designed to make
                content creation a breeze. Simply choose your desired mini game
                type, and you&apos;re ready to go!
              </span>
            </div>
          </li>
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-xl font-semibold">
                Variety of Mini Games
              </span>
              <span className="mt-2 text-zinc-700">
                Choose from a variety of mini game options, including quizzes,
                riddles, Q&A sessions, and more. With our diverse range of
                templates, you&apos;ll never run out of ideas for engaging
                content.
              </span>
            </div>
          </li>
        </ol>
        <ol className="my-8 space-y-4 pt-8 md:flex md:space-x-12 md:space-y-0">
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-xl font-semibold">
                AI-Generated Content
              </span>
              <span className="mt-2 text-zinc-700">
                Harness the power of AI technology to generate dynamic and
                engaging content for your mini games. Our AI algorithms ensure
                that your quizzes and riddles are always fresh and exciting.
              </span>
            </div>
          </li>
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-xl font-semibold">Seamless Sharing</span>
              <span className="mt-2 text-zinc-700">
                Once your mini game is ready, share it seamlessly across your
                social media channels with just a few clicks. Engage with your
                audience, spark conversations, and boost your online presence
                effortlessly.
              </span>
            </div>
          </li>
        </ol>
      </div>
    </>
  );
};

export default Page;
