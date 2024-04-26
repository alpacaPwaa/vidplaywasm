"use client";

import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();

  const handleGeneralKnowledgeTemplate = async () => {
    try {
      router.push(`/dashboard/templates/general-knowledge-quiz`);
    } catch (error) {
      console.error("Error creating file:", error);
    }
  };

  const handleRiddleMethis = async () => {
    try {
      router.push(`/dashboard/templates/riddle-me-this`);
    } catch (error) {
      console.error("Error creating file:", error);
    }
  };

  return (
    <main className="mx-auto max-w-7xl md:p-10">
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-bold text-5xl text-gray-900">Templates</h1>
      </div>

      {/* display all templates */}
      <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <li>
          <div
            className="flex flex-col gap-2 rounded-lg bg-white shadow transition hover:shadow-lg cursor-pointer"
            onClick={handleGeneralKnowledgeTemplate}
          >
            <div className="flex w-full items-center justify-center space-x-6">
              <video
                src="/templates-thumbnail/generalquizthumbnail.mp4"
                className="h-auto w-5/12 p-2"
              ></video>
            </div>
          </div>
          <div className="mt-2 font-semibold">General Knowledge Quiz</div>
        </li>

        <li>
          <div
            className="flex flex-col gap-2 rounded-lg bg-white shadow transition hover:shadow-lg cursor-pointer"
            onClick={handleRiddleMethis}
          >
            <div className="flex w-full items-center justify-center space-x-6">
              <video
                src="/templates-thumbnail/riddlemethisthumbnail.mp4"
                className="h-auto w-5/12 p-2"
              ></video>
            </div>
          </div>
          <div className="mt-2 font-semibold">Riddle Me This</div>
        </li>
      </ul>
    </main>
  );
};

export default Dashboard;
