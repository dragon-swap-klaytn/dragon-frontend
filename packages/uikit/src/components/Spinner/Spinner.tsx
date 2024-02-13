import React from "react";
import { styled } from "styled-components";
import { Box } from "../Box";
import { Image } from "../Image";
import { SpinnerProps } from "./types";

const StyledAnimationImg = styled(Image)`
  position: relative;
  -moz-animation: bounce 0.5s infinite linear;
  -webkit-animation: bounce 0.5s infinite linear;
  -o-animation: bounce 0.5s infinite linear;
  animation: bounce 0.5s infinite linear;
  @-webkit-keyframes bounce {
    0% {
      top: 0;
      filter: drop-shadow(0px 24px 6px #c3c3c3);
    }

    50% {
      top: -5px;
      filter: drop-shadow(0px 29px 6px #c3c3c3);
    }

    70% {
      top: -25px;
      filter: drop-shadow(0px 49px 6px #c3c3c3);
    }

    100% {
      top: 0;
      filter: drop-shadow(0px 24px 6px #c3c3c3);
    }
  }

  @-moz-keyframes bounce {
    0% {
      top: 0;
      filter: drop-shadow(0px 24px 6px #c3c3c3);
    }

    50% {
      top: -5px;
      filter: drop-shadow(0px 29px 6px #c3c3c3);
    }

    70% {
      top: -25px;
      filter: drop-shadow(0px 49px 6px #c3c3c3);
    }

    100% {
      top: 0;
      filter: drop-shadow(0px 24px 6px #c3c3c3);
    }
  }

  @-o-keyframes bounce {
    0% {
      top: 0;
      filter: drop-shadow(0px 24px 6px #c3c3c3);
    }

    50% {
      top: -5px;
      filter: drop-shadow(0px 29px 6px #c3c3c3);
    }

    70% {
      top: -25px;
      filter: drop-shadow(0px 49px 6px #c3c3c3);
    }

    100% {
      top: 0;
      filter: drop-shadow(0px 24px 6px #c3c3c3);
    }
  }

  @-ms-keyframes bounce {
    0% {
      top: 0;
      filter: drop-shadow(0px 24px 6px #c3c3c3);
    }

    50% {
      top: -5px;
      filter: drop-shadow(0px 29px 6px #c3c3c3);
    }

    70% {
      top: -25px;
      filter: drop-shadow(0px 49px 6px #c3c3c3);
    }

    100% {
      top: 0;
      filter: drop-shadow(0px 24px 6px #c3c3c3);
    }
  }

  @keyframes bounce {
    0% {
      top: 0;
      filter: drop-shadow(0px 24px 6px #c3c3c3);
    }

    50% {
      top: -5px;
      filter: drop-shadow(0px 29px 6px #c3c3c3);
    }

    70% {
      top: -25px;
      filter: drop-shadow(0px 49px 6px #c3c3c3);
    }

    100% {
      top: 0;
      filter: drop-shadow(0px 24px 6px #c3c3c3);
    }
  }
`;

const Spinner: React.FC<React.PropsWithChildren<SpinnerProps>> = ({ size = 128 }) => {
  return (
    <Box width={size} height={size * 1.197} position="relative">
      <StyledAnimationImg
        width={size}
        height={size * 1.197}
        src="/images/decorations/dgs-light.png"
        alt="bounced-dragon-logo"
      />
    </Box>
  );
};

export default Spinner;
