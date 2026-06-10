import Image from "next/image";
import Box from "@mui/material/Box";

interface WorkanaBotAvatarProps {
  size?: number;
}

export function WorkanaBotAvatar({ size = 20 }: WorkanaBotAvatarProps) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        mt: size <= 24 ? 0.5 : 0,
        borderRadius: "50%",
        overflow: "hidden",
      }}
    >
      <Image
        src="/workana-brand-logo.jpg"
        alt="Workana"
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: "cover" }}
      />
    </Box>
  );
}
