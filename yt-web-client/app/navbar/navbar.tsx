'use client';

import Image from "next/image";
import Link from "next/link";
import styles from "./navbar.module.css";
import SignIn from "./sign-in";
import { useEffect, useState } from "react";
import { onAuthStateChangedHandler } from "../firebase/firebase";
import { User } from "firebase/auth";
import Upload from "./upload";

export default function Navbar() {
  // Init user state
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedHandler((user) => {
      setUser(user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  });

  return (
    <nav className={styles.nav}>
      <Link href="/">
        <Image width={90} height={20} src="/youtube-logo.svg" alt="Youtube Clone Home Page"/>
      </Link>
      {
        user && <Upload />
      }
      <SignIn user={user}/>
    </nav>
  );
}