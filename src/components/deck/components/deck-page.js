/** @jsx jsx */
import { jsx } from "theme-ui";
import App from "./app";
import Deck from "./deck";

export const DeckPage = (props) => {
  return (
    <App>
      <Deck {...props} slides={props.children} />
    </App>
  );
};

export default DeckPage;
