import Image from "next/image";
import Link from "next/link";
import styles from "./navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <Link href="/">
        <Image width={90} height={20} src="/youtube-logo.svg" alt="Youtube Clone Home Page"/>
      </Link>
    </nav>
  );
}