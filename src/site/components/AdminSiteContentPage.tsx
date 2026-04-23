import { FormEvent, useEffect, useMemo, useState } from "react";
import { defaultSiteContent, normalizeSiteContent } from "../siteContent";
import {
  AlbumFolder,
  CauseCard,
  EventAlbum,
  GalleryImage,
  InquiryForm,
  SiteContent,
  TabConfig,
  TabId
} from "../types";
import { CausesPage } from "./CausesPage";
import { CauseDialog } from "./CauseDialog";
import { ConnectPage } from "./ConnectPage";
import { DonatePage } from "./DonatePage";
import { HomePage } from "./HomePage";
import { initialForm } from "../content";
import { ZeffyDonateDialog } from "./ZeffyDonateDialog";

type AdminSiteContentPageProps = {
  details: TabConfig;
  onContentSaved?: (content: SiteContent) => void;
};

async function readJson(response: Response) {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createId(prefix: string, value: string) {
  const slug = slugify(value) || "item";
  return `${prefix}-${slug}-${Date.now().toString(36)}`;
}

function albumFallback(): EventAlbum {
  return {
    id: createId("album", "new album"),
    title: "New album",
    category: "new",
    label: "New",
    summary: "Describe the album here.",
    cover: {
      src: "/assets/jaana-wordmark.png",
      alt: "Album cover",
      caption: "Album cover"
    },
    photos: []
  };
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to read the selected file."));
    };
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}

export function AdminSiteContentPage({ details, onContentSaved }: AdminSiteContentPageProps) {
  const [authState, setAuthState] = useState<"loading" | "signedOut" | "signedIn">("loading");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("Sign in to edit the site content.");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetStatus, setResetStatus] = useState("");
  const [editableContent, setEditableContent] = useState<SiteContent>(defaultSiteContent);
  const [savedContent, setSavedContent] = useState<SiteContent>(defaultSiteContent);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>(defaultSiteContent.tabs[0]?.id ?? "home");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [selectedCause, setSelectedCause] = useState<CauseCard | null>(null);
  const [donateDialogOpen, setDonateDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"idle" | "success" | "error">("idle");
  const [editorStatus, setEditorStatus] = useState("Saved content stays on the public site.");
  const [editorView, setEditorView] = useState<"content" | "media">("content");
  const [jsonDraft, setJsonDraft] = useState(JSON.stringify(defaultSiteContent, null, 2));
  const [jsonError, setJsonError] = useState("");
  const [jsonDirty, setJsonDirty] = useState(false);
  const [newFolderTitle, setNewFolderTitle] = useState("");
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [selectedImageCaption, setSelectedImageCaption] = useState("");
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [imageInputKey, setImageInputKey] = useState(0);
  const [folderFormOpen, setFolderFormOpen] = useState(false);
  const [albumFormOpen, setAlbumFormOpen] = useState(false);
  const [imageFormOpen, setImageFormOpen] = useState(false);

  const currentFolders = editableContent.groupedEventAlbums;
  const selectedFolder = useMemo(
    () => (selectedFolderId ? currentFolders.find((folder) => folder.id === selectedFolderId) ?? null : null),
    [currentFolders, selectedFolderId]
  );
  const selectedAlbum = useMemo(
    () => (selectedFolder && selectedAlbumId ? selectedFolder.albums.find((album) => album.id === selectedAlbumId) ?? null : null),
    [selectedAlbumId, selectedFolder]
  );
  const mediaLevel = selectedAlbum ? "images" : selectedFolder ? "subfolders" : "folders";

  const syncJsonDraft = (content: SiteContent) => {
    setJsonDraft(JSON.stringify(content, null, 2));
    setJsonError("");
    setJsonDirty(false);
  };

  const updateContent = (updater: (current: SiteContent) => SiteContent) => {
    setEditableContent((current) => updater(current));
  };

  const updateNestedContent = <K extends keyof SiteContent>(key: K, updater: (value: SiteContent[K]) => SiteContent[K]) => {
    updateContent((current) => ({
      ...current,
      [key]: updater(current[key])
    }));
  };

  const loadEditorContent = async () => {
    const response = await fetch("/api/admin/site-content", {
      credentials: "include"
    });

    if (response.status === 401) {
      setAuthState("signedOut");
      setLoginStatus("Sign in to edit the site content.");
      setEditorStatus("Sign in to edit the site content.");
      return false;
    }

    const payload = (await readJson(response)) as Partial<SiteContent> & { error?: string };

    if (!response.ok) {
      setEditorStatus(payload.error ?? "Unable to load the site content.");
      return false;
    }

    const content = normalizeSiteContent(payload);

    setEditableContent(content);
    setSavedContent(content);
    syncJsonDraft(content);
    setIsEditing(false);
    setEditorStatus("Loaded the site content.");
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
          setLoginStatus("Sign in to edit the site content.");
          return;
        }

        setAuthState("signedIn");
        await loadEditorContent();
      } catch {
        if (!cancelled) {
          setAuthState("signedOut");
          setLoginStatus("Sign in to edit the site content.");
        }
      }
    };

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadHealth = async () => {
      try {
        const response = await fetch("/api/health");

        if (!response.ok) {
          throw new Error("Unable to reach the inquiry service.");
        }

        const payload = (await response.json()) as { status: string };

        if (!cancelled) {
          setBackendOnline(payload.status === "ok");
        }
      } catch {
        if (!cancelled) {
          setBackendOnline(false);
        }
      }
    };

    void loadHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!jsonDirty) {
      syncJsonDraft(editableContent);
    }
  }, [editableContent, jsonDirty]);

  useEffect(() => {
    setSelectedFolderId((current) => {
      if (currentFolders.some((folder) => folder.id === current)) {
        return current;
      }

      return "";
    });
  }, [currentFolders]);

  useEffect(() => {
    if (!selectedFolder) {
      setSelectedAlbumId("");
      return;
    }

    setSelectedAlbumId((current) => {
      if (selectedFolder.albums.some((album) => album.id === current)) {
        return current;
      }

      return "";
    });
  }, [selectedFolder]);

  useEffect(() => {
    setActiveTab((current) => {
      if (editableContent.tabs.some((tab) => tab.id === current)) {
        return current;
      }

      return editableContent.tabs[0]?.id ?? "home";
    });
  }, [editableContent.tabs]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [activeTab]);

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(editableContent) !== JSON.stringify(savedContent),
    [editableContent, savedContent]
  );

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
      setIsEditing(false);
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
    setResetStatus("Sending password reminder...");

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
        throw new Error(payload.error ?? "Unable to send the password reminder.");
      }

      setResetStatus(payload.message ?? "Password reminder sent.");
      setForgotPasswordOpen(false);
    } catch (error) {
      setResetStatus(error instanceof Error ? error.message : "Unable to send the password reminder.");
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");
    setStatusTone("idle");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Something went wrong.");
      }

      setForm(initialForm);
      setStatusTone("success");
      setStatusMessage(payload.message ?? "Thanks for reaching out.");
    } catch (error) {
      setStatusTone("error");
      setStatusMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormFieldChange = <K extends keyof typeof initialForm>(field: K, value: (typeof initialForm)[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include"
      });
    } finally {
      setAuthState("signedOut");
      setLoginStatus("Sign in to edit the site content.");
      setLoginPassword("");
      setIsEditing(false);
      setEditorView("content");
      setEditorStatus("Sign in to edit the site content.");
    }
  };

  const applyJsonDraft = () => {
    try {
      const parsed = JSON.parse(jsonDraft) as Partial<SiteContent>;
      const content = normalizeSiteContent(parsed);

      setEditableContent(content);
      setJsonError("");
      setJsonDirty(false);
      setEditorStatus("Applied the JSON draft.");
      return true;
    } catch {
      setJsonError("The JSON draft is invalid. Fix it before saving.");
      setEditorStatus("Fix the JSON draft before saving.");
      return false;
    }
  };

  const handleSave = async () => {
    if (jsonDirty && !applyJsonDraft()) {
      return;
    }

    setIsSaving(true);
    setEditorStatus("Saving changes...");

    try {
      const response = await fetch("/api/admin/site-content", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editableContent)
      });

      const payload = (await readJson(response)) as { content?: SiteContent; error?: string };

      if (response.status === 401) {
        setAuthState("signedOut");
        setLoginStatus("Sign in to edit the site content.");
        throw new Error("Your admin session expired. Sign in again.");
      }

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save site content.");
      }

      const saved = payload.content ?? editableContent;
      setEditableContent(saved);
      setSavedContent(saved);
      syncJsonDraft(saved);
      onContentSaved?.(saved);
      setEditorStatus("Saved to the site.");
    } catch (error) {
      setEditorStatus(error instanceof Error ? error.message : "Unable to save site content.");
    } finally {
      setIsSaving(false);
    }
  };

  const undoChanges = () => {
    setEditableContent(savedContent);
    syncJsonDraft(savedContent);
    setEditorStatus("Reverted to the last saved version.");
  };

  const addFolder = () => {
    if (!newFolderTitle.trim()) {
      setEditorStatus("Enter a folder title first.");
      return;
    }

    const folderTitle = newFolderTitle.trim();
    const nextFolder: AlbumFolder = {
      id: createId("folder", folderTitle),
      title: folderTitle,
      description: `${folderTitle} photo collections and event memories.`,
      albums: []
    };

    updateContent((current) => ({
      ...current,
      groupedEventAlbums: [...current.groupedEventAlbums, nextFolder]
    }));

    setSelectedFolderId(nextFolder.id);
    setSelectedAlbumId("");
    setNewFolderTitle("");
    setFolderFormOpen(false);
    setAlbumFormOpen(false);
    setEditorStatus(`Added folder ${nextFolder.title}.`);
  };

  const addAlbum = () => {
    const folderIndex = currentFolders.findIndex((folder) => folder.id === selectedFolderId);

    if (folderIndex < 0) {
      setEditorStatus("Choose a folder first.");
      return;
    }

    if (!newAlbumTitle.trim()) {
      setEditorStatus("Enter an album title first.");
      return;
    }

    const albumTitle = newAlbumTitle.trim();
    const fallbackAlbum = albumFallback();
    const nextAlbum: EventAlbum = {
      ...fallbackAlbum,
      id: createId("album", albumTitle),
      title: albumTitle,
      category: currentFolders[folderIndex].id,
      label: "Album",
      summary: `${albumTitle} photo collection.`,
      cover: {
        ...fallbackAlbum.cover,
        alt: `${albumTitle} cover`,
        caption: `${albumTitle} cover`
      },
      photos: []
    };

    updateContent((current) => {
      const nextFolders = current.groupedEventAlbums.map((folder, index) =>
        index === folderIndex ? { ...folder, albums: [...folder.albums, nextAlbum] } : folder
      );

      return {
        ...current,
        groupedEventAlbums: nextFolders
      };
    });

    setSelectedAlbumId(nextAlbum.id ?? "");
    setNewAlbumTitle("");
    setAlbumFormOpen(false);
    setImageFormOpen(false);
    setEditorStatus(`Added subfolder ${nextAlbum.title}.`);
  };

  const addImage = async () => {
    const folderIndex = currentFolders.findIndex((folder) => folder.id === selectedFolderId);
    const albumIndex = selectedFolder?.albums.findIndex((album) => album.id === selectedAlbumId) ?? -1;

    if (folderIndex < 0 || albumIndex < 0) {
      setEditorStatus("Choose a folder and subfolder first.");
      return;
    }

    if (!pendingImageFile) {
      setEditorStatus("Choose an image file first.");
      return;
    }

    if (!selectedImageCaption.trim()) {
      setEditorStatus("Enter an image caption first.");
      return;
    }

    const imageCaption = selectedImageCaption.trim();
    const src = await readFileAsDataUrl(pendingImageFile);
    const nextImage: GalleryImage = {
      src,
      alt: imageCaption,
      caption: imageCaption
    };

    updateContent((current) => {
      const nextFolders = current.groupedEventAlbums.map((folder, currentFolderIndex) => {
        if (currentFolderIndex !== folderIndex) {
          return folder;
        }

        return {
          ...folder,
          albums: folder.albums.map((album, currentAlbumIndex) => {
            if (currentAlbumIndex !== albumIndex) {
              return album;
            }

            return {
              ...album,
              photos: [...album.photos, nextImage],
              cover: album.photos[0] ?? nextImage ?? album.cover
            };
          })
        };
      });

      return {
        ...current,
        groupedEventAlbums: nextFolders
      };
    });

    setEditorStatus(`Added image to ${selectedAlbum?.title ?? "the subfolder"}.`);
    setSelectedImageCaption("");
    setPendingImageFile(null);
    setImageInputKey((current) => current + 1);
    setImageFormOpen(false);
  };

  const contentSummary = useMemo(
    () => [
      `${editableContent.tabs.length} tabs`,
      `${editableContent.causeCards.length} causes`,
      `${editableContent.groupedEventAlbums.length} folders`,
      `${editableContent.contactChannels.length} contacts`
    ],
    [editableContent]
  );

  const activeTabDetails = editableContent.tabs.find((tab) => tab.id === activeTab) ?? editableContent.tabs[0] ?? defaultSiteContent.tabs[0];

  const updateActiveTab = <K extends keyof TabConfig>(key: K, value: TabConfig[K]) => {
    updateNestedContent("tabs", (tabs) =>
      tabs.map((tab) => (tab.id === activeTabDetails.id ? { ...tab, [key]: value } : tab))
    );
  };

  const updateCauseCard = (index: number, key: "title" | "summary" | "minimum", value: string) => {
    updateNestedContent("causeCards", (cards) =>
      cards.map((card, cardIndex) => (cardIndex === index ? { ...card, [key]: value } : card))
    );
  };

  const updateContactChannel = (index: number, key: "label" | "value" | "href", value: string) => {
    updateNestedContent("contactChannels", (channels) =>
      channels.map((channel, channelIndex) => (channelIndex === index ? { ...channel, [key]: value } : channel))
    );
  };

  const updateInquiryTopics = (topics: string[]) => {
    updateNestedContent("inquiryTopics", () => topics);
  };

  const handleActivateTab = (tabId: TabId) => {
    setActiveTab(tabId);
    setMobileNavOpen(false);
    setEditorStatus(`Viewing ${tabId} page.`);
  };

  const closeMediaManager = () => {
    setEditorView("content");
    setSelectedFolderId("");
    setSelectedAlbumId("");
    setFolderFormOpen(false);
    setAlbumFormOpen(false);
    setImageFormOpen(false);
    setNewFolderTitle("");
    setNewAlbumTitle("");
    setSelectedImageCaption("");
    setPendingImageFile(null);
    setImageInputKey((current) => current + 1);
  };

  const openMediaRoot = () => {
    setEditorView("media");
    setSelectedFolderId("");
    setSelectedAlbumId("");
    setFolderFormOpen(false);
    setAlbumFormOpen(false);
    setImageFormOpen(false);
    setNewFolderTitle("");
    setNewAlbumTitle("");
    setSelectedImageCaption("");
    setPendingImageFile(null);
    setImageInputKey((current) => current + 1);
    setEditorStatus("Viewing media folders.");
  };

  const openFolder = (folderId: string) => {
    const folder = currentFolders.find((item) => item.id === folderId);
    setSelectedFolderId(folderId);
    setSelectedAlbumId("");
    setFolderFormOpen(false);
    setAlbumFormOpen(false);
    setImageFormOpen(false);
    setSelectedImageCaption("");
    setPendingImageFile(null);
    setImageInputKey((current) => current + 1);
    setEditorStatus(`Viewing subfolders in ${folder?.title ?? "the folder"}.`);
  };

  const openAlbum = (albumId: string) => {
    const album = selectedFolder?.albums.find((item) => item.id === albumId);
    setSelectedAlbumId(albumId);
    setAlbumFormOpen(false);
    setImageFormOpen(false);
    setSelectedImageCaption("");
    setPendingImageFile(null);
    setImageInputKey((current) => current + 1);
    setEditorStatus(`Viewing images in ${album?.title ?? "the subfolder"}.`);
  };

  const goBackInMedia = () => {
    if (selectedAlbum) {
      setSelectedAlbumId("");
      setImageFormOpen(false);
      setSelectedImageCaption("");
      setPendingImageFile(null);
      setImageInputKey((current) => current + 1);
      setEditorStatus(`Viewing subfolders in ${selectedFolder?.title ?? "the folder"}.`);
      return;
    }

    if (selectedFolder) {
      setSelectedFolderId("");
      setAlbumFormOpen(false);
      setEditorStatus("Viewing media folders.");
      return;
    }

    closeMediaManager();
  };

  const adminPanelTitle = editorView === "media" ? "Media manager" : isEditing ? "Editing enabled" : "Preview mode";
  const adminPanelDescription =
    editorView === "media"
      ? "Folders open into subfolders, and subfolders open into images."
      : isEditing
        ? "Text on the page is editable in place."
        : "Open edit mode to change visible copy.";
  const mediaTitle =
    mediaLevel === "folders" ? "Folders" : mediaLevel === "subfolders" ? selectedFolder?.title ?? "Subfolders" : selectedAlbum?.title ?? "Images";
  const mediaDescription =
    mediaLevel === "folders"
      ? "Start by choosing a folder or create a new one."
      : mediaLevel === "subfolders"
        ? "Open a subfolder or add a new one inside this folder."
        : "Add images with captions only to this subfolder.";

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
        <p>Only the admin account can edit the site content. The public site remains open.</p>
        <div className="admin-auth-actions">
          <button className="secondary-button" type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
    ) : (
      <div className="admin-auth-card">
        <span className="section-kicker">Admin login</span>
        <h3>Sign in to edit the site.</h3>
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
              Forgot password?
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
            <p>Send a password reminder to the email you typed above.</p>
            <div className="admin-auth-actions">
              <button className="secondary-button" type="button" onClick={handleResetPassword} disabled={isSendingReset}>
                {isSendingReset ? "Sending..." : "Email password reminder"}
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

  if (authState !== "signedIn") {
    return (
      <section id="admin-panel" className="subpage-shell donate-shell" aria-label="Admin site editor">
        <div className="subpage-hero">
          <div className="subpage-copy">
            <span className="section-kicker">Admin</span>
            <h2>Sign in to edit the site</h2>
            <p>The public site stays the same. Only the admin route can change text and media.</p>
          </div>

          <aside className="subpage-aside admin-auth-sidebar">{authCard}</aside>
        </div>
      </section>
    );
  }

  const isOverviewTab = activeTab === "home";

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header-inner">
          <div className="mobile-nav-shell">
            <button
              className={mobileNavOpen ? "mobile-nav-toggle is-open" : "mobile-nav-toggle"}
              type="button"
              aria-label={mobileNavOpen ? "Close site navigation" : "Open site navigation"}
              aria-expanded={mobileNavOpen}
              aria-controls="admin-site-nav"
              onClick={() => setMobileNavOpen((current) => !current)}
            >
              <span className="mobile-nav-icon" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="mobile-nav-label">Menu</span>
            </button>

            <div id="admin-site-nav" className={mobileNavOpen ? "mobile-site-nav is-open" : "mobile-site-nav"}>
              <nav className="site-nav mobile-site-nav-list" aria-label="Site pages" role="tablist">
                {editableContent.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`${tab.id}-panel`}
                    className={activeTab === tab.id ? "site-tab is-active" : "site-tab"}
                    onClick={() => handleActivateTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <button
            className="brand-lockup"
            onClick={() => handleActivateTab("home")}
            type="button"
            aria-label="Go to home"
          >
            <img src="/assets/jaana-logo-blue.png" alt="JAANA logo" />
          </button>

          <div className="house-shields header-shields" aria-label="SJBHS house shields">
            {editableContent.houseShields.map((shield) => (
              <div className="house-shield" key={shield.src}>
                <img src={shield.src} alt={shield.alt} />
              </div>
            ))}
          </div>

          <div className="header-actions">
            <nav className="site-nav" aria-label="Site pages" role="tablist">
              {editableContent.tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                  className={activeTab === tab.id ? "site-tab is-active" : "site-tab"}
                  onClick={() => handleActivateTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <section className="admin-controls-section" aria-label="Admin controls">
        <div className="admin-controls-bar">
          <div className="admin-controls-copy">
            <span className="section-kicker">Admin tools</span>
            <h3>{adminPanelTitle}</h3>
            <p>{adminPanelDescription}</p>
          </div>

          <div className="admin-controls-actions">
            <button
              className={isEditing ? "secondary-button is-active" : "secondary-button"}
              type="button"
              onClick={() => setIsEditing((current) => !current)}
            >
              {isEditing ? "Done editing" : "Edit texts"}
            </button>
            <button
              className={editorView === "media" ? "secondary-button is-active" : "secondary-button"}
              type="button"
              onClick={() => (editorView === "media" ? closeMediaManager() : openMediaRoot())}
            >
              Manage media
            </button>
            <button className="primary-button" type="button" onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
              {isSaving ? "Saving..." : "Save changes"}
            </button>
            <button className="secondary-button" type="button" onClick={undoChanges} disabled={!hasUnsavedChanges || isSaving}>
              Undo
            </button>
            <button className="secondary-button" type="button" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>
      </section>

      <main className={isOverviewTab ? "main-overview" : "main-subpage"}>
        {activeTab === "home" ? (
          <HomePage
            connectMoments={editableContent.connectMoments}
            homeCopy={editableContent.homeCopy}
            editable={isEditing}
            onChangeHomeCopy={(key, value) =>
              updateNestedContent("homeCopy", (homeCopy) => ({
                ...homeCopy,
                [key]: value
              }))
            }
            onActivateTab={handleActivateTab}
            onOpenPastEventsDialog={() => setEditorStatus("Past events live in the public view.")}
            onOpenLightboxImage={() => setEditorStatus("Media opens in the public view.")}
          />
        ) : null}

        {activeTab === "causes" ? (
          <CausesPage
            details={activeTabDetails}
            causeCards={editableContent.causeCards}
            causesCopy={editableContent.causesCopy}
            editable={isEditing}
            onChangeDetails={updateActiveTab}
            onChangeCausesCopy={(key, value) =>
              updateNestedContent("causesCopy", (causesCopy) => ({
                ...causesCopy,
                [key]: value
              }))
            }
            onChangeCauseCard={updateCauseCard}
            onSelectCause={setSelectedCause}
          />
        ) : null}

        {activeTab === "donate" ? (
          <DonatePage
            details={activeTabDetails}
            backendOnline={backendOnline}
            contactChannels={editableContent.contactChannels}
            inquiryTopics={editableContent.inquiryTopics}
            donateCopy={editableContent.donateCopy}
            editable={isEditing}
            form={form}
            isSubmitting={isSubmitting}
            statusMessage={statusMessage}
            statusTone={statusTone}
            onSubmit={handleSubmit}
            onFieldChange={handleFormFieldChange}
            onDonateClick={() => setDonateDialogOpen(true)}
            onChangeDetails={updateActiveTab}
            onChangeDonateCopy={(key, value) =>
              updateNestedContent("donateCopy", (donateCopy) => ({
                ...donateCopy,
                [key]: value
              }))
            }
            onChangeContactChannel={updateContactChannel}
            onChangeInquiryTopics={updateInquiryTopics}
          />
        ) : null}

        {activeTab === "connect" ? (
          <ConnectPage
            details={activeTabDetails}
            connectContent={editableContent.connectPage}
            connectCopy={editableContent.connectCopy}
            editable={isEditing}
            onChangeDetails={updateActiveTab}
            onChangeConnectCopy={(key, value) =>
              updateNestedContent("connectCopy", (connectCopy) => ({
                ...connectCopy,
                [key]: value
              }))
            }
            onChangeConnectContent={(key, value) =>
              updateNestedContent("connectPage", (connectPage) => ({
                ...connectPage,
                [key]: value
              }))
            }
          />
        ) : null}

        {editorView === "media" ? (
          <div className="admin-media-overlay" onClick={closeMediaManager}>
            <div className="admin-media-drawer" onClick={(event) => event.stopPropagation()} role="dialog" aria-label="Media folders editor">
              <div className="admin-media-drawer-head">
                <div className="admin-media-drawer-copy">
                  <span className="section-kicker">Media folders</span>
                  <h3>{mediaTitle}</h3>
                  <p>{mediaDescription}</p>
                </div>
                <div className="admin-media-drawer-actions">
                  {mediaLevel !== "folders" ? (
                    <button className="secondary-button" type="button" onClick={goBackInMedia}>
                      Back
                    </button>
                  ) : null}
                  <button className="secondary-button" type="button" onClick={closeMediaManager}>
                    Close
                  </button>
                </div>
              </div>

              <nav className="admin-media-breadcrumbs" aria-label="Media navigation">
                <button
                  type="button"
                  className={mediaLevel === "folders" ? "admin-media-breadcrumb is-current" : "admin-media-breadcrumb"}
                  onClick={openMediaRoot}
                >
                  Folders
                </button>
                {selectedFolder ? (
                  <>
                    <span className="admin-media-breadcrumb-separator" aria-hidden="true">
                      /
                    </span>
                    <button
                      type="button"
                      className={mediaLevel === "subfolders" ? "admin-media-breadcrumb is-current" : "admin-media-breadcrumb"}
                      onClick={() => {
                        setSelectedAlbumId("");
                        setAlbumFormOpen(false);
                        setImageFormOpen(false);
                        setSelectedImageCaption("");
                        setPendingImageFile(null);
                        setImageInputKey((current) => current + 1);
                        setEditorStatus(`Viewing subfolders in ${selectedFolder.title}.`);
                      }}
                    >
                      {selectedFolder.title}
                    </button>
                  </>
                ) : null}
                {selectedAlbum ? (
                  <>
                    <span className="admin-media-breadcrumb-separator" aria-hidden="true">
                      /
                    </span>
                    <span className="admin-media-breadcrumb is-current">{selectedAlbum.title}</span>
                  </>
                ) : null}
              </nav>

              <div className="admin-media-stage">
                {mediaLevel === "folders" ? (
                  <>
                    <div className="folder-grid admin-media-stage-grid" aria-label="Media folders">
                      {currentFolders.map((folder) => (
                        <button key={folder.id} type="button" className="folder-card" onClick={() => openFolder(folder.id)}>
                          <div className="folder-card-thumb">
                            <img src={folder.albums[0]?.cover.src ?? "/assets/jaana-wordmark.png"} alt={folder.title} />
                          </div>
                          <div className="folder-card-copy">
                            <span>{folder.albums.length} subfolders</span>
                            <h3>{folder.title}</h3>
                            <p>Open folder</p>
                          </div>
                        </button>
                      ))}

                      <button
                        type="button"
                        className="folder-card folder-card-add"
                        onClick={() => {
                          setFolderFormOpen((current) => !current);
                          setAlbumFormOpen(false);
                          setImageFormOpen(false);
                        }}
                      >
                        <div className="folder-card-thumb folder-card-add-thumb">
                          <span aria-hidden="true">+</span>
                        </div>
                        <div className="folder-card-copy">
                          <span>Add folder</span>
                          <h3>New folder</h3>
                          <p>Create a top-level folder.</p>
                        </div>
                      </button>
                    </div>

                    {folderFormOpen ? (
                      <div className="admin-inline-form-card admin-media-form">
                        <label>
                          <span>Folder name</span>
                          <input className="connect-edit-input" value={newFolderTitle} onChange={(event) => setNewFolderTitle(event.target.value)} />
                        </label>
                        <div className="admin-media-form-actions">
                          <button className="primary-button" type="button" onClick={addFolder}>
                            Create folder
                          </button>
                          <button className="secondary-button" type="button" onClick={() => setFolderFormOpen(false)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}

                {mediaLevel === "subfolders" && selectedFolder ? (
                  <>
                    <div className="folder-grid admin-media-stage-grid" aria-label={`${selectedFolder.title} subfolders`}>
                      {selectedFolder.albums.map((album) => (
                        <button key={album.id ?? album.title} type="button" className="folder-card" onClick={() => openAlbum(album.id ?? "")}>
                          <div className="folder-card-thumb">
                            <img src={album.cover.src} alt={album.cover.alt} />
                          </div>
                          <div className="folder-card-copy">
                            <span>{album.photos.length} images</span>
                            <h3>{album.title}</h3>
                            <p>Open subfolder</p>
                          </div>
                        </button>
                      ))}

                      <button
                        type="button"
                        className="folder-card folder-card-add"
                        onClick={() => {
                          setAlbumFormOpen((current) => !current);
                          setImageFormOpen(false);
                        }}
                      >
                        <div className="folder-card-thumb folder-card-add-thumb">
                          <span aria-hidden="true">+</span>
                        </div>
                        <div className="folder-card-copy">
                          <span>Add subfolder</span>
                          <h3>New subfolder</h3>
                          <p>Create a subfolder in this folder.</p>
                        </div>
                      </button>
                    </div>

                    {albumFormOpen ? (
                      <div className="admin-inline-form-card admin-media-form">
                        <label>
                          <span>Subfolder name</span>
                          <input className="connect-edit-input" value={newAlbumTitle} onChange={(event) => setNewAlbumTitle(event.target.value)} />
                        </label>
                        <div className="admin-media-form-actions">
                          <button className="primary-button" type="button" onClick={addAlbum}>
                            Create subfolder
                          </button>
                          <button className="secondary-button" type="button" onClick={() => setAlbumFormOpen(false)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {!selectedFolder.albums.length && !albumFormOpen ? (
                      <div className="admin-media-empty">
                        <p>No subfolders yet. Add the first subfolder for {selectedFolder.title}.</p>
                      </div>
                    ) : null}
                  </>
                ) : null}

                {mediaLevel === "images" && selectedFolder && selectedAlbum ? (
                  <>
                    <div className="folder-photo-grid admin-media-image-grid" aria-label={`${selectedAlbum.title} images`}>
                      {selectedAlbum.photos.map((photo, index) => (
                        <article key={`${photo.src}-${index}`} className="folder-photo admin-media-image-card">
                          <img src={photo.src} alt={photo.alt} />
                          <span>{photo.caption}</span>
                        </article>
                      ))}

                      <button
                        type="button"
                        className="folder-photo folder-photo-add"
                        onClick={() => setImageFormOpen((current) => !current)}
                      >
                        <div className="folder-photo-add-icon">+</div>
                        <span>Add image</span>
                      </button>
                    </div>

                    {imageFormOpen ? (
                      <div className="admin-inline-form-card admin-media-form">
                        <label>
                          <span>Caption</span>
                          <input
                            className="connect-edit-input"
                            value={selectedImageCaption}
                            onChange={(event) => setSelectedImageCaption(event.target.value)}
                          />
                        </label>
                        <label className="full-width">
                          <span>Image file</span>
                          <input
                            key={imageInputKey}
                            className="connect-edit-input admin-file-input"
                            type="file"
                            accept="image/*"
                            onChange={(event) => setPendingImageFile(event.target.files?.[0] ?? null)}
                          />
                        </label>
                        <p className="admin-auth-status">
                          Uploads go only to <strong>{selectedFolder.title}</strong> / <strong>{selectedAlbum.title}</strong>.
                        </p>
                        <div className="admin-media-form-actions">
                          <button className="primary-button" type="button" onClick={() => void addImage()}>
                            Upload image
                          </button>
                          <button
                            className="secondary-button"
                            type="button"
                            onClick={() => {
                              setImageFormOpen(false);
                              setSelectedImageCaption("");
                              setPendingImageFile(null);
                              setImageInputKey((current) => current + 1);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {!selectedAlbum.photos.length && !imageFormOpen ? (
                      <div className="admin-media-empty">
                        <p>No images yet. Add the first image to {selectedAlbum.title}.</p>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <strong>JAANA</strong>
          <span>The Josephite Alumni Association of North America.</span>
        </div>
        <div className="footer-contacts">
          {editableContent.contactChannels.map((channel) => (
            <a
              key={channel.label}
              href={channel.href}
              target={channel.href.startsWith("http") ? "_blank" : undefined}
              rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
            >
              <span className="contact-label">{channel.label}</span>
              <span className="contact-value">{channel.value}</span>
            </a>
          ))}
        </div>
      </footer>

      {selectedCause ? (
        <CauseDialog
          cause={selectedCause}
          onClose={() => setSelectedCause(null)}
          onDonateClick={() => setDonateDialogOpen(true)}
          disableEscape={donateDialogOpen}
        />
      ) : null}

      <ZeffyDonateDialog open={donateDialogOpen} onClose={() => setDonateDialogOpen(false)} />
    </div>
  );
}
