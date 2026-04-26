import { FormEvent, useEffect, useMemo, useState } from "react";
import { defaultConnectPageContent } from "../content";
import { ConnectPageContent, TabConfig } from "../types";
import { handleRovingTabKeyDown } from "../accessibility";

type AdminConnectPageProps = {
  details: TabConfig;
};

async function readJson(response: Response) {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function AdminConnectPage({ details }: AdminConnectPageProps) {
  const [authState, setAuthState] = useState<"loading" | "signedOut" | "signedIn">("loading");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("Sign in to edit the Connect content.");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetStatus, setResetStatus] = useState("");
  const [editableContent, setEditableContent] = useState<ConnectPageContent>(defaultConnectPageContent);
  const [savedContent, setSavedContent] = useState<ConnectPageContent>(defaultConnectPageContent);
  const [activeScheduleTab, setActiveScheduleTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [editorStatus, setEditorStatus] = useState("Saved content stays on the site.");

  const loadEditorContent = async () => {
    const response = await fetch("/api/admin/connect-content", {
      credentials: "include"
    });

    if (response.status === 401) {
      setAuthState("signedOut");
      setLoginStatus("Sign in to edit the Connect content.");
      setEditorStatus("Sign in to edit the Connect content.");
      return false;
    }

    const payload = (await readJson(response)) as Partial<ConnectPageContent> & { error?: string };

    if (!response.ok) {
      setEditorStatus(payload.error ?? "Unable to load the Connect content.");
      return false;
    }

    const content = {
      sponsorMessage:
        typeof payload.sponsorMessage === "string" && payload.sponsorMessage.trim()
          ? payload.sponsorMessage
          : defaultConnectPageContent.sponsorMessage,
      placeholders: Array.isArray(payload.placeholders)
        ? payload.placeholders.map((item, index) => ({
            title:
              typeof item?.title === "string" && item.title.trim()
                ? item.title
                : defaultConnectPageContent.placeholders[index]?.title ?? "Details",
            body:
              typeof item?.body === "string" && item.body.trim()
                ? item.body
                : defaultConnectPageContent.placeholders[index]?.body ?? "Details coming soon."
          }))
        : defaultConnectPageContent.placeholders
    };

    setEditableContent(content);
    setSavedContent(content);
    setActiveScheduleTab(0);
    setEditorStatus("Loaded content from the site.");

    return true;
  };

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      try {
        const response = await fetch("/api/admin/session", {
          credentials: "include"
        });

        const payload = (await readJson(response)) as { authenticated?: boolean; error?: string };

        if (cancelled) {
          return;
        }

        if (!response.ok || !payload.authenticated) {
          setAuthState("signedOut");
          setLoginStatus("Sign in to edit the Connect content.");
          return;
        }

        setAuthState("signedIn");
        void loadEditorContent();
      } catch {
        if (!cancelled) {
          setAuthState("signedOut");
          setLoginStatus("Sign in to edit the Connect content.");
        }
      }
    };

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setActiveScheduleTab((current) => Math.min(current, Math.max(editableContent.placeholders.length - 1, 0)));
  }, [editableContent.placeholders.length]);

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(editableContent) !== JSON.stringify(savedContent),
    [editableContent, savedContent]
  );

  const updatePlaceholder = (index: number, field: keyof ConnectPageContent["placeholders"][number], value: string) => {
    setEditableContent((current) => ({
      ...current,
      placeholders: current.placeholders.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginStatus("Checking credentials...");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });

      const payload = (await readJson(response)) as { authenticated?: boolean; error?: string };

      if (!response.ok || !payload.authenticated) {
        throw new Error(payload.error ?? "Unable to sign in.");
      }

      setAuthState("signedIn");
      setLoginEmail("");
      setLoginPassword("");
      setLoginStatus("Signed in.");
      await loadEditorContent();
    } catch (error) {
      setLoginStatus(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleResetPassword = async () => {
    setIsSendingReset(true);
    setResetStatus("Sending sign-in reminder...");

    try {
      const response = await fetch("/api/admin/password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: loginEmail
        })
      });

      const payload = (await readJson(response)) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to send the sign-in reminder.");
      }

      setResetStatus(payload.message ?? "Sign-in reminder sent.");
      setForgotPasswordOpen(false);
    } catch (error) {
      setResetStatus(error instanceof Error ? error.message : "Unable to send the sign-in reminder.");
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include"
      });
    } finally {
      setAuthState("signedOut");
      setLoginStatus("Sign in to edit the Connect content.");
      setLoginPassword("");
      setEditorStatus("Sign in to edit the Connect content.");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setEditorStatus("Saving changes...");

    try {
      const response = await fetch("/api/admin/connect-content", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editableContent)
      });

      const payload = (await readJson(response)) as { content?: ConnectPageContent; error?: string };

      if (response.status === 401) {
        setAuthState("signedOut");
        setLoginStatus("Sign in to edit the Connect content.");
        throw new Error("Your admin session expired. Sign in again.");
      }

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save Connect content.");
      }

      const saved = payload.content ?? editableContent;
      setEditableContent(saved);
      setSavedContent(saved);
      setEditorStatus("Saved to the site.");
    } catch (error) {
      setEditorStatus(error instanceof Error ? error.message : "Unable to save Connect content.");
    } finally {
      setIsSaving(false);
    }
  };

  const undoChanges = () => {
    setEditableContent(savedContent);
    setEditorStatus("Reverted to the last saved version.");
  };

  const authCard =
    authState === "loading" ? (
      <div className="admin-auth-card">
        <span className="section-kicker">Admin login</span>
        <h3>Checking admin session...</h3>
        <p>Loading the hidden editor.</p>
      </div>
    ) : authState === "signedIn" ? (
      <div className="admin-auth-card">
        <span className="section-kicker">Admin access</span>
        <h3>Signed in.</h3>
        <p>Only the admin account can edit the Connect page. The public site remains open.</p>
        <div className="admin-auth-actions">
          <button className="secondary-button" type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
    ) : (
      <div className="admin-auth-card">
        <span className="section-kicker">Admin login</span>
        <h3>Sign in to edit the Connect page.</h3>
        <p>The public site stays open. Only the hidden admin route can change the content.</p>

        <form className="admin-auth-form" onSubmit={handleLogin}>
          <label className="admin-auth-field">
            <span>Email</span>
            <input
              className="connect-edit-input"
              type="email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="admin-auth-field">
            <span>Password</span>
            <input
              className="connect-edit-input"
              type="password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <div className="admin-auth-actions">
            <button className="primary-button" type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? "Signing in..." : "Sign in"}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => setForgotPasswordOpen((current) => !current)}
              disabled={isLoggingIn}
            >
              Need sign-in help?
            </button>
          </div>
        </form>

        {loginStatus ? (
          <p className="admin-auth-status" aria-live="polite">
            {loginStatus}
          </p>
        ) : null}

        {forgotPasswordOpen ? (
          <div className="admin-reset-panel">
            <p>Send a sign-in reminder to the email you typed above.</p>
            <div className="admin-auth-actions">
              <button className="secondary-button" type="button" onClick={handleResetPassword} disabled={isSendingReset}>
                {isSendingReset ? "Sending..." : "Email sign-in reminder"}
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => setForgotPasswordOpen(false)}
                disabled={isSendingReset}
              >
                Close
              </button>
            </div>
            {resetStatus ? (
              <p className="admin-auth-status" aria-live="polite">
                {resetStatus}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    );

  return (
    <section id="admin-panel" className="subpage-shell donate-shell" aria-label="Admin Connect editor">
      <div className="subpage-hero">
        <div className="subpage-copy">
          <span className="section-kicker">Admin</span>
          <h2>{details.title}</h2>
          <p>{details.copy}</p>
        </div>

        <aside className="subpage-aside admin-auth-sidebar">{authCard}</aside>
      </div>

      {authState === "signedIn" ? (
        <>
          <div className="connect-editor-toolbar">
            <button className="primary-button" type="button" onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
              {isSaving ? "Saving..." : "Save site content"}
            </button>
            <button className="secondary-button" type="button" onClick={undoChanges} disabled={!hasUnsavedChanges || isSaving}>
              Undo changes
            </button>
            <span className="connect-editor-note">{editorStatus}</span>
          </div>

          <div className="section-block">
            <div className="connect-sponsor-callout">
              <div>
                <h3>Support North America Connect 2026.</h3>
                <textarea
                  className="connect-edit-textarea"
                  value={editableContent.sponsorMessage}
                  onChange={(event) =>
                    setEditableContent((current) => ({
                      ...current,
                      sponsorMessage: event.target.value
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="section-block">
            <div className="connect-schedule-shell">
              <div className="featured-heading">
                <div>
                  <h3>Connect schedule content</h3>
                  <p>Edit the tab labels and body copy shown on the public site.</p>
                </div>
              </div>

              <div className="connect-schedule-tabs" role="tablist" aria-label="Connect details tabs">
                {editableContent.placeholders.map((item, index) => (
                  <button
                    key={`admin-connect-detail-${index}`}
                    type="button"
                    id={`admin-connect-detail-tab-${index}`}
                    role="tab"
                    aria-selected={activeScheduleTab === index}
                    aria-controls={`admin-connect-detail-panel-${index}`}
                    tabIndex={activeScheduleTab === index ? 0 : -1}
                    className={`connect-schedule-tab ${activeScheduleTab === index ? "is-active" : ""}`}
                    onClick={() => setActiveScheduleTab(index)}
                    onKeyDown={handleRovingTabKeyDown}
                  >
                    {item.title || `Details ${index + 1}`}
                  </button>
                ))}
              </div>

              <div
                id={`admin-connect-detail-panel-${activeScheduleTab}`}
                className="connect-schedule-panel"
                role="tabpanel"
                aria-labelledby={`admin-connect-detail-tab-${activeScheduleTab}`}
                tabIndex={0}
              >
                <input
                  className="connect-edit-input"
                  value={editableContent.placeholders[activeScheduleTab]?.title ?? ""}
                  onChange={(event) => updatePlaceholder(activeScheduleTab, "title", event.target.value)}
                />
                <textarea
                  className="connect-edit-textarea"
                  value={editableContent.placeholders[activeScheduleTab]?.body ?? ""}
                  onChange={(event) => updatePlaceholder(activeScheduleTab, "body", event.target.value)}
                />
              </div>
            </div>
          </div>
        </>
      ) : authState === "signedOut" ? (
        <div className="section-block">
          <div className="connect-sponsor-callout">
            <div>
              <span className="section-kicker">Access</span>
              <h3>Sign in to open the editor.</h3>
              <p>{editorStatus}</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
