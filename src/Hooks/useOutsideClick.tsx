import React, { useEffect } from "react";

function useOutsideClick(
  ref: React.RefObject<HTMLDivElement> | undefined,
  onClickOutside: (isOutside: boolean) => any,
) {
  let isOutside = false;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref && ref.current && !ref.current.contains(event.target as Node)) {
        isOutside = true;
      } else {
        isOutside = false;
      }

      //execute function that was passed in depending if the click was outside
      onClickOutside(isOutside);
    };

    // Bind the event listener
    document.addEventListener("click", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("click", handleClickOutside);
    };
  }, [ref]);
}

export default useOutsideClick;
