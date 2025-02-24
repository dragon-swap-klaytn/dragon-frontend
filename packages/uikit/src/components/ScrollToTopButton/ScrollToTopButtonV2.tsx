import { ArrowUp } from "@phosphor-icons/react";
import throttle from "lodash/throttle";
import { useCallback, useEffect, useState } from "react";
import { styled } from "styled-components";

const FixedContainer = styled.div`
  position: fixed;
  right: 18px;
  bottom: calc(110px + env(safe-area-inset-bottom));
`;

const ScrollToTopButtonV2 = () => {
  const [visible, setVisible] = useState(false);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const toggleVisible = () => {
      const scrolled = document.documentElement.scrollTop;
      if (scrolled > 500) {
        setVisible(true);
      } else if (scrolled <= 500) {
        setVisible(false);
      }
    };

    const throttledToggleVisible = throttle(toggleVisible, 200);

    window.addEventListener("scroll", throttledToggleVisible);

    return () => window.removeEventListener("scroll", throttledToggleVisible);
  }, []);

  return (
    <FixedContainer style={{ display: visible ? "inline" : "none" }}>
      <button
        type="button"
        className="w-12 h-12 flex items-center justify-center bg-brand rounded-2xl hover:opacity-70"
        onClick={scrollToTop}
      >
        <ArrowUp className="text-on-surface w-5 h-5" weight="bold" />
      </button>
    </FixedContainer>
  );
};

export default ScrollToTopButtonV2;
