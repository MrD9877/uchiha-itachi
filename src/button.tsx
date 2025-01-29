import React, { useState } from "react";

const Button = () => {
  const [color, setColor] = useState("blue");

  const changeColor = () => {
    setColor(color === "blue" ? "red" : "blue");
  };

  return (
    <button style={{ backgroundColor: color }} onClick={changeColor}>
      Click me
    </button>
  );
};

export default Button;
