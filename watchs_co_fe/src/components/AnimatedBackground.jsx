import { useEffect, useState } from "react";
import { backgroundImages } from "../constants/images";
import "./AnimatedBackground.css";

const AnimatedBackground = ({ children }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="animated-hero"
      style={{
        backgroundImage: `url(${backgroundImages[index]})`,
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedBackground;
