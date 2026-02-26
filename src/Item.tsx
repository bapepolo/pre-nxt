import { useEffect, useRef, useState } from "react";

function PickerItem({
  title,
  text,
  isActive,
  distance,
  isFullscreen
}: {
  title: string;
  text: string;
  isActive: boolean;
  distance: number;
  isFullscreen: boolean;
}) {
  const textRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);

  const absDistance = Math.abs(distance);

  const scale = 1 - absDistance * 0.15;
  const opacity = 1 - absDistance * 0.3;

  const itemHeight = isFullscreen ? 90 : 40;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = textRef.current;
    if (!wrapper || !content) return;

    const measure = () => {
      const overflowAmount = content.scrollWidth - wrapper.clientWidth;
      setIsOverflow(overflowAmount > 0);

      // scroll animation
      if (overflowAmount > 0 && isActive) {
        const fadePercent = 0.08;
        const fadeWidth = wrapper.clientWidth * fadePercent;

        const totalDistance = overflowAmount + fadeWidth;

        const speed = 8; // px per sec
        const minDuration = 4;
        const duration = Math.max(minDuration, overflowAmount / speed);

        content.style.setProperty(
          "--scroll-start",
          `${fadeWidth}px`
        );

        content.style.setProperty(
          "--scroll-end",
          `-${totalDistance}px`
        );

        content.style.setProperty(
          "--scroll-duration",
          `${duration}s`
        );

        content.style.transition = "transform 0.3s ease";
        content.style.transform = `translateX(${fadeWidth}px)`;
      } else {
        content.classList.remove("scrolling");

        content.style.removeProperty("--scroll-start");
        content.style.removeProperty("--scroll-end");
        content.style.removeProperty("--scroll-duration");

        content.style.transform = "";
      }
    };

    // measure layout after resize
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });

    observer.observe(wrapper);
    measure();

    return () => observer.disconnect();
  }, [text, isActive, isFullscreen]);

  return (
    <div
      className={`item ${isActive ? "active" : ""}`}
      title={title}
      style={{
        transform: `translateY(${distance * itemHeight}px) scale(${scale})`,
        opacity: opacity < 0 ? 0 : opacity,
        zIndex: 100 - absDistance,
      }}
    >
      <div ref={wrapperRef} className="text-wrapper">
        <div
          ref={textRef}
          className={`text-content ${
            isActive && isOverflow ? "scrolling" : ""
          }`}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

export default PickerItem;