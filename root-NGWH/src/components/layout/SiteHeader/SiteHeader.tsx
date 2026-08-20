"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { BRAND } from "../../../config/brand";
import { LanguageSwitcher } from "../LanguageSwitcher/LanguageSwitcher";
import { Container } from "../../ui/Container/Container";
import styles from "./SiteHeader.module.scss";

const NAV_ITEMS = [
  { href: "/", labelKey: "home" },
  { href: "/about", labelKey: "about" },
  { href: "/tournaments", labelKey: "tournaments" },
  { href: "/news", labelKey: "news" },
  { href: "/gallery", labelKey: "gallery" },
  { href: "/clubs", labelKey: "clubs" },
  { href: "/club-registration", labelKey: "clubRegistration" },
  { href: "/contact", labelKey: "contact" },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");
  const common = useTranslations("common");
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id: number; email: string; role: string } | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setIsUserMenuOpen(false);
      setIsMobileMenuOpen(false);
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const headerClassName = [
    styles.header,
    isScrolled ? styles.scrolled : "",
    isMobileMenuOpen ? styles.menuOpen : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClassName}>
      <a href="#main-content" className={styles.skipLink}>
        {common("skipToContent")}
      </a>
      <Container className={styles.container}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logoLink} onClick={closeMobileMenu}>
            <span className={styles.logoText}>{BRAND.name}</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.navLink}>
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Actions */}
        <div className={styles.desktopActions}>
          <LanguageSwitcher />
          {user ? (
            <div className={styles.userMenuWrapper}>
              <button
                type="button"
                className={styles.userMenuBtn}
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <span className={styles.userAvatar}>
                  {user.email.charAt(0).toUpperCase()}
                </span>
                <span className={styles.userName}>
                  {user.email.split("@")[0]}
                </span>
                <svg
                  className={styles.chevronIcon}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  width="16"
                  height="16"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {isUserMenuOpen && (
                <div className={styles.userDropdown}>
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownEmail}>{user.email}</span>
                  </div>
                  <Link
                    href="/account"
                    className={styles.dropdownItem}
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    {t("accountInfo")}
                  </Link>
                  <Link
                    href="/account/clubs"
                    className={styles.dropdownItem}
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    {t("myClubs")}
                  </Link>
                  <button
                    type="button"
                    className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    onClick={handleLogout}
                  >
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link href="/login" className={styles.signInBtn}>
                {t("signIn")}
              </Link>
              <Link href="/register" className={styles.registerBtn}>
                {t("register")}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          className={styles.menuButton}
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation-menu"
          aria-label={isMobileMenuOpen ? t("closeMenu") : t("openMenu")}
        >
          {isMobileMenuOpen ? (
            <svg
              className={styles.menuIcon}
              viewBox="0 0 24 24"
              width="24"
              height="24"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              className={styles.menuIcon}
              viewBox="0 0 24 24"
              width="24"
              height="24"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </Container>

      {/* Mobile Navigation Menu Drawer */}
      <div
        id="mobile-navigation-menu"
        className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuVisible : ""}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <Container className={styles.mobileMenuContainer}>
          <nav className={styles.mobileNav} aria-label="Mobile navigation">
            <ul className={styles.mobileNavList}>
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={styles.mobileNavLink}
                    onClick={closeMobileMenu}
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.mobileActions}>
            <LanguageSwitcher />
            {user ? (
              <div className={styles.mobileUserSection}>
                <div className={styles.mobileUserInfo}>
                  <span className={styles.mobileUserAvatar}>
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                  <span className={styles.mobileUserEmail}>{user.email}</span>
                </div>
                <div className={styles.mobileUserLinks}>
                  <Link
                    href="/account"
                    className={styles.mobileUserLink}
                    onClick={closeMobileMenu}
                  >
                    {t("accountInfo")}
                  </Link>
                  <Link
                    href="/account/clubs"
                    className={styles.mobileUserLink}
                    onClick={closeMobileMenu}
                  >
                    {t("myClubs")}
                  </Link>
                  <button
                    type="button"
                    className={styles.mobileLogoutBtn}
                    onClick={handleLogout}
                  >
                    {t("logout")}
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.mobileAuthButtons}>
                <Link
                  href="/login"
                  className={styles.mobileSignInBtn}
                  onClick={closeMobileMenu}
                >
                  {t("signIn")}
                </Link>
                <Link
                  href="/register"
                  className={styles.mobileRegisterBtn}
                  onClick={closeMobileMenu}
                >
                  {t("register")}
                </Link>
              </div>
            )}
          </div>
        </Container>
      </div>
    </header>
  );
}
