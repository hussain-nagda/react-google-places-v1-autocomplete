import { useEffect, useState } from "react";

export const useDebounce = (text : string, delay : number) => {
    const [inputText, setInputText] = useState("")
    useEffect(() => {
      const timeout = setTimeout(() => {
        setInputText(text);
      }, delay);
  
      return () => clearTimeout(timeout); 
    }, [text, delay])
    return inputText
  }