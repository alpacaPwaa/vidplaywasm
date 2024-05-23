"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

import generalQuizThumbnail from "/public/templates-thumbnail/generalquizthumbnail.png";
import riddleMeThisThumbnail from "/public/templates-thumbnail/riddlemethisthumbnail.png";
import comingSoonThumbnail from "/public/templates-thumbnail/coomingsoon.png";

const templates = [
  {
    id: 1,
    title: "General Knowledge Quiz",
    imageSrc: generalQuizThumbnail,
    onClick: () => "/dashboard/templates/general-knowledge-quiz",
  },
  {
    id: 2,
    title: "Riddle Me This",
    imageSrc: riddleMeThisThumbnail,
    onClick: () => "/dashboard/templates/riddle-me-this",
  },
  {
    id: 3,
    title: "Q & A",
    imageSrc: comingSoonThumbnail,
    onClick: () => "#",
  },
  {
    id: 4,
    title: "Fill In The Blank",
    imageSrc: comingSoonThumbnail,
    onClick: () => "#",
  },
  {
    id: 5,
    title: "Easy to Difficult Quiz",
    imageSrc: comingSoonThumbnail,
    onClick: () => "#",
  },
  {
    id: 6,
    title: "Would You Rather?",
    imageSrc: comingSoonThumbnail,
    onClick: () => "#",
  },
  {
    id: 7,
    title: "Logo Quiz",
    imageSrc: comingSoonThumbnail,
    onClick: () => "#",
  },
];

const Dashboard = () => {
  const router = useRouter();

  const handleTemplateClick = (path: string) => {
    try {
      router.push(path);
    } catch (error) {
      console.error("Error navigating to template:", error);
    }
  };

  return (
    <main className="mx-auto max-w-7xl md:p-10">
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-bold text-5xl text-gray-900">Templates</h1>
      </div>

      {/* Display all templates */}
      <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-5">
        {templates.map((template) => (
          <li
            key={template.id}
            className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg cursor-pointer"
            onClick={() => handleTemplateClick(template.onClick())}
          >
            <div className="flex w-full items-center justify-center">
              <Image
                src={template.imageSrc}
                alt={template.title}
                className="p-1"
                width={75}
                height={75}
                quality={100}
                key={template.id}
              />
            </div>
            <div className="flex w-full items-center font-semibold p-2">
              {template.title}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default Dashboard;
