"use client";
import { IoGrid } from "react-icons/io5";
import { MdViewStream } from "react-icons/md";

const ToggleView = ({ searchParams, view }) => {
  const handleToggleView = (newView) => {
    const params = new URLSearchParams(searchParams);
    params.set("view", newView);
    window.history.pushState(null, "", `?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleToggleView("grid")}
        className={`flex items-center justify-center size-8 sm:size-10 text-muted-foreground transition-colors duration-300 cursor-pointer gap-2 rounded-full ${
          view === "grid"
            ? "bg-primary text-white"
            : "hover:bg-black/15 hover:text-black"
        }`}
      >
        <IoGrid className="size-5 sm:size-6" />
      </button>
      <button
        onClick={() => handleToggleView("list")}
        className={`flex items-center justify-center size-8 sm:size-10 text-muted-foreground hover:text-black transition-colors duration-300 cursor-pointer gap-2 rounded-full ${
          view === "list"
            ? "bg-primary text-white"
            : "hover:text-black hover:bg-black/15"
        }`}
      >
        <MdViewStream className="size-5 sm:size-6" />
      </button>
    </div>
  );
};

export default ToggleView;
