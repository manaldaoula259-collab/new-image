import { createPreviewMedia, resizeImage } from "@/core/utils/upload";
import useProjectContext from "@/hooks/use-project-context";
import {
  Button,
  ButtonGroup,
  Center,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useS3Upload } from "next-s3-upload";
import { useRef, useState } from "react";
import {
  FixedCropper,
  FixedCropperRef,
  ImageRestriction,
} from "react-advanced-cropper";
import { useDropzone } from "react-dropzone";
import { BsCloudArrowUp, BsImage } from "react-icons/bs";
import { FilePreview } from "../dashboard/Uploader";

import "react-advanced-cropper/dist/style.css";
import "react-advanced-cropper/dist/themes/compact.css";

const PromptImage = () => {
  const [isLoading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure({
    onClose: () => {
      setImagePreview(undefined);
    },
  });

  const { setPromptImageUrl } = useProjectContext();
  const cropperRef = useRef<FixedCropperRef>(null);

  const [imagePreview, setImagePreview] = useState<FilePreview>();

  const { uploadToS3 } = useS3Upload();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg", ".jpg"],
    },
    maxSize: 10000000,
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles?.[0]) {
        setImagePreview(createPreviewMedia(acceptedFiles[0]));
      }
    },
  });

  const handleSubmit = async () => {
    if (!cropperRef.current) {
      return;
    }

    setLoading(true);
    const canvas = cropperRef.current.getCanvas({
      height: 512,
      width: 512,
    })!;

    canvas.toBlob(async (blob) => {
      const croppedImage = createPreviewMedia(blob!);
      const file = await resizeImage(croppedImage as File);

      const { url } = await uploadToS3(file);
      setLoading(false);

      setPromptImageUrl(url);
      onClose();
    }, "image/jpeg");
  };

  return (
    <>
      <Button
        rightIcon={<BsImage />}
        variant="ghostOnDark"
        size="sm"
        border="1px solid var(--border-subtle)"
        onClick={onOpen}
      >
        Use image as model
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="auto" backdropBlur="8px" />
        <ModalContent
          as="form"
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();

            handleSubmit();
          }}
          background="var(--bg-surface)"
          border="1px solid var(--border-subtle)"
          boxShadow="0 40px 90px rgba(8, 14, 26, 0.65)"
        >
          <ModalHeader>Use image as model</ModalHeader>
          <ModalCloseButton color="var(--text-primary)" />
          <ModalBody>
            {imagePreview ? (
              <FixedCropper
                ref={cropperRef}
                src={imagePreview && imagePreview.preview}
                stencilSize={{ width: 512, height: 512 }}
                imageRestriction={ImageRestriction.stencil}
              />
            ) : (
              <Center
                _hover={{
                  bg: "rgba(15, 23, 42, 0.82)",
                  borderColor: "var(--border-emphasis)",
                }}
                fontSize="sm"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                backgroundColor="var(--bg-surfaceMuted)"
                cursor="pointer"
                borderRadius="2xl"
                border="1px dashed var(--border-subtle)"
                boxShadow="inset 0 0 0 1px rgba(148, 163, 184, 0.15)"
                p={10}
                flexDirection="column"
                {...getRootProps({ className: "dropzone" })}
              >
                <input {...getInputProps()} />
                <Icon as={BsCloudArrowUp} fontSize="3xl" color="brand.400" />
                <Text mt={2} color="var(--text-muted)">
                  Upload reference image
                </Text>
              </Center>
            )}
          </ModalBody>

          <ModalFooter>
            <ButtonGroup>
              <Button onClick={onClose} variant="ghostOnDark">
                Cancel
              </Button>
              <Button
                disabled={!imagePreview}
                isLoading={isLoading}
                variant="brand"
                type="submit"
              >
                Use image
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PromptImage;
