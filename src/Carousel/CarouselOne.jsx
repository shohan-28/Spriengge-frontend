
import { useEffect, useState } from "react";
import "./PremiumCarousel.css";

const images = [
  "https://i.postimg.cc/zfb4vfdC/file-00000000e34081fabf655d487693ee56.jpg",
  "https://i.postimg.cc/Pqg9wkcC/file-00000000747c81f58c51aa187e10fe61.jpg",
  "https://i.postimg.cc/5thTCMGH/file-000000004b8c81f59d45e649d979ece5.jpg",
  "https://i.postimg.cc/zfs6g1MV/file-0000000037ec8206b51edc5b1389d35e.jpg",
];

const PremiumCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  const getPosition = (index) => {
    const total = images.length;

    if (index === current) return "active";

    if (index === (current - 1 + total) % total) {
      return "prev";
    }

    if (index === (current + 1) % total) {
      return "next";
    }

    return "hidden";
  };

  return (
    <section className="premium-carousel">
      <div className="carousel-container">

        <div className="carousel-stage">
          {images.map((image, index) => (
            <div
              key={index}
              className={`carousel-card ${getPosition(index)}`}
            >
              <img
                src={image}
                alt={`Slide ${index + 1}`}
              />
            </div>
          ))}
        </div>

        <button
          className="carousel-arrow left"
          onClick={prevSlide}
          aria-label="Previous"
        >
          ‹
        </button>

        <button
          className="carousel-arrow right"
          onClick={nextSlide}
          aria-label="Next"
        >
          ›
        </button>

        <div className="carousel-dots">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`dot ${current === index ? "active" : ""}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default PremiumCarousel;

