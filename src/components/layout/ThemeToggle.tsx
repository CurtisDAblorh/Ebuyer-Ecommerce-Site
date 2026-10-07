"use client";

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import { useColorScheme } from "@mui/material/styles";

export function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const resolved = mode === "system" ? systemMode : mode;
  // `mode` is undefined until mounted; render a stable placeholder icon first.
  const dark = resolved === "dark";
  return (
    <Tooltip title={dark ? "Light mode" : "Dark mode"}>
      <IconButton aria-label="Toggle colour theme" onClick={() => setMode(dark ? "light" : "dark")}>
        {dark ? <LightModeOutlined /> : <DarkModeOutlined />}
      </IconButton>
    </Tooltip>
  );
}
