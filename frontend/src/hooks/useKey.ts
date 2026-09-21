import { useCallback, useRef } from "react";

export  function useKey() {
    const counter = useRef(0);
    return useCallback(() => counter.current++, []);
}
