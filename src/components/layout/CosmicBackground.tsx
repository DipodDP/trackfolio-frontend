"use client";

export function CosmicBackground() {
  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
      {/* Stars */}
      <div className="star star-md" style={{ top: "10%", left: "15%" }} />
      <div className="star star-sm" style={{ top: "25%", left: "5%" }} />
      <div className="star star-lg" style={{ top: "12%", left: "80%" }} />
      <div className="star star-sm" style={{ top: "40%", left: "95%" }} />
      <div className="star star-md" style={{ top: "80%", left: "90%" }} />
      <div className="star star-sm" style={{ top: "60%", left: "10%" }} />
      <div className="star star-lg" style={{ top: "90%", left: "30%" }} />
      <div className="star star-md" style={{ top: "5%", left: "40%" }} />
      <div className="star star-sm" style={{ top: "55%", left: "65%" }} />

      {/* Diagonal Lines */}
      <div
        className="diagonal-line"
        style={{ top: "20%", left: "10%", width: "15%", transform: "rotate(-30deg)" }}
      />
      <div
        className="diagonal-line"
        style={{ top: "70%", left: "60%", width: "20%", transform: "rotate(-30deg)" }}
      />
    </div>
  );
}

export default CosmicBackground;
