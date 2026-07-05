"use client";

import { useEffect, useState } from "react";

interface NumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
  > {
  value: number;
  onChange: (value: number) => void;
}

export function NumberInput({
  value,
  onChange,
  ...props
}: NumberInputProps) {
  const [text, setText] = useState(value === 0 ? "" : String(value));

  useEffect(() => {
    // Don't overwrite while user is typing
    const normalized =
      text === "" || text === "-" ? 0 : Number(text);

    if (normalized !== value) {
      setText(value === 0 ? "" : String(value));
    }
  }, [value]);

  return (
    <input
      {...props}
      type="number"
      value={text}
      onWheel={(e) => {
    e.currentTarget.blur();
    props.onWheel?.(e); // still allows overriding if needed
  }}
      onChange={(e) => {
        const v = e.target.value;

        setText(v);

        if (v === "" || v === "-") {
          onChange(0);
          return;
        }

        const num = Number(v);

        if (!Number.isNaN(num)) {
          onChange(num);
        }
      }}
    />
  );
}