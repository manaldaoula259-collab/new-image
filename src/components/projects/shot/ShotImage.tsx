import { Box, useDisclosure } from "@chakra-ui/react";
import type { IShot } from "@/types/models";
import Image from "next/image";
import React from "react";
import { Controlled as ControlledZoom } from "react-medium-image-zoom";

const ShotImage = ({ shot, isHd = false }: { shot: IShot; isHd?: boolean }) => {
  const { onOpen, onClose, isOpen: isZoomed } = useDisclosure();

  return (
    <Box
      width="100%"
      backgroundColor="var(--bg-surfaceMuted)"
      overflow="hidden"
    >
      {/* @ts-ignore - react-medium-image-zoom ControlledZoom children type inference issue */}
      <ControlledZoom
        isZoomed={isZoomed}
        onZoomChange={(shouldZoom) => {
          shouldZoom ? onOpen() : onClose();
        }}
      >
        <Box>
        <Image
          placeholder="blur"
          blurDataURL={shot.blurhash || "placeholder"}
          alt={shot.prompt}
          src={isHd ? shot.hdOutputUrl! : shot.outputUrl!}
          width={512}
          height={512}
          unoptimized
        />
        </Box>
      </ControlledZoom>
    </Box>
  );
};

export default ShotImage;
