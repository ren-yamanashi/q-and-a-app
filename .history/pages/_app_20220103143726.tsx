import { RecoilRoot } from "recoil";
import "../styles/globals.css";
import "../lib/firebase";
import "../lib/authentication";

function MyApp({ Component, pageProps }) {
  return (
    <RecoilRoot>
      <Component {...pageProps} />
    </RecoilRoot>
  );
}

export default MyApp;
