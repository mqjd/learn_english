import useDeck from "../hooks/use-deck";
import { useEffect } from "react";

export const Notes = (props) => {
  const context = useDeck();
  useEffect(() => {
    context.register(context.index, "notes", props.children);
  }, [props.children]);// eslint-disable-line react-hooks/exhaustive-deps

  return false;
};

export default Notes;
