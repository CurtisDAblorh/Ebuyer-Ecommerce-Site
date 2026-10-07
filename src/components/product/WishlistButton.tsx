"use client";

import IconButton, { type IconButtonProps } from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Favorite from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleWishlist } from "@/store/shopperSlice";
import { showToast } from "@/store/uiSlice";

export function WishlistButton({
  id,
  title,
  ...props
}: { id: number; title: string } & Omit<IconButtonProps, "id">) {
  const dispatch = useAppDispatch();
  const saved = useAppSelector((s) => s.shopper.wishlist.includes(id));
  return (
    <Tooltip title={saved ? "Remove from wishlist" : "Save to wishlist"} placement="left">
      <IconButton
        aria-label={saved ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`}
        aria-pressed={saved}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dispatch(toggleWishlist(id));
          dispatch(
            showToast({
              message: saved ? "Removed from wishlist" : "Saved to wishlist",
              severity: "info",
            }),
          );
        }}
        {...props}
        sx={{
          bgcolor: "background.paper",
          boxShadow: 1,
          color: saved ? "secondary.main" : "text.primary",
          transition: "transform .2s",
          "&:hover": { bgcolor: "background.paper", transform: "scale(1.1)" },
          "&:active": { transform: "scale(0.9)" },
          ...props.sx,
        }}
      >
        {saved ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
