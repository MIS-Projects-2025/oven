import { IconToggleRight, IconToggleLeft } from "@tabler/icons-react";

export default function ThemeToggler({ toggleTheme, theme }) {
  return (
    <div className="flex items-center justify-start pl-3 mt-auto space-x-3 cursor-pointer">
      <div onClick={toggleTheme} className="flex items-center gap-2">

        {/* Toggle Icon */}
        {theme === "dark" ? (
          <IconToggleRight
            size={40}
            className="text-black drop-shadow-[0_0_6px_rgba(100,149,237,0.9)]"
          />
        ) : (
          <IconToggleLeft
            size={40}
            className="text-blue-100 drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]"
          />
        )}

        {/* Text label WITH GLOW */}
        <span
          className={
            theme === "dark"
              ? "text-sm text-black drop-shadow-[0_0_6px_rgba(0,0,0,0.8)]"
              : "text-sm text-blue-100 drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]"
          }
        >
          {theme === "dark" ? "Dark Mode" : "Light Mode"}
        </span>

      </div>
    </div>
  );
}
