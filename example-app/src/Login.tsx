import {
  browserLocalPersistence,
  User,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
} from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { auth } from "./firebase/firebase.init";
import Skeleton from "@onepercentio/one-ui/dist/components/Skeleton";

export default function Login() {
  const [user, setUser] = useState<User | null>();
  useEffect(() => {
    onAuthStateChanged(auth, (a) => {
      setUser(a);
    });
  }, []);

  const content = useMemo(() => {
    switch (user) {
      case undefined:
        return <Skeleton width={10} height={1} />;
      case null:
        return (
          <>
            <button
              onClick={() =>
                signInWithEmailAndPassword(
                  auth,
                  "muritavo@outlook.com",
                  "somepass"
                )
              }
            >
              login
            </button>
          </>
        );
      default:
        return <span>Logado como {user.email}</span>;
    }
  }, [user]);

  return (
    <>
      <p>{localStorage.key(0) || "aspdojsap"}</p>
      {content}
    </>
  );
}
