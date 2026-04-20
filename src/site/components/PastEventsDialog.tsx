import { useMemo, useState } from "react";
import { AlbumFolder, EventAlbum, GalleryImage } from "../types";

type PastEventsDialogProps = {
  folders: AlbumFolder[];
  onClose: () => void;
  onOpenLightboxImage: (image: GalleryImage) => void;
};

export function PastEventsDialog({ folders, onClose, onOpenLightboxImage }: PastEventsDialogProps) {
  const [selectedFolder, setSelectedFolder] = useState<AlbumFolder | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<EventAlbum | null>(null);

  const dialogTitle = useMemo(() => {
    if (selectedAlbum) {
      return selectedAlbum.title;
    }

    if (selectedFolder) {
      return selectedFolder.title;
    }

    return "Past JAANA Events";
  }, [selectedAlbum, selectedFolder]);

  const handleCloseButton = () => {
    if (selectedAlbum) {
      setSelectedAlbum(null);
      return;
    }

    if (selectedFolder) {
      setSelectedFolder(null);
      return;
    }

    onClose();
  };

  return (
    <div className="album-dialog" role="dialog" aria-modal="true" aria-labelledby="past-events-dialog-title" onClick={onClose}>
      <div className="album-dialog-shell" onClick={(event) => event.stopPropagation()}>
        <button
          className="lightbox-close album-dialog-close"
          type="button"
          onClick={handleCloseButton}
          aria-label="Close dialog"
        >
          ×
        </button>

        <div className="album-dialog-header">
          <div>
            {selectedAlbum ? (
              <>
                <button className="inline-button album-breadcrumb" type="button" onClick={() => setSelectedAlbum(null)}>
                  Back to {selectedFolder?.title ?? "albums"}
                </button>
                <span className="support-note">{selectedAlbum.label}</span>
                <h3 id="past-events-dialog-title">{dialogTitle}</h3>
                <p>{selectedAlbum.summary}</p>
              </>
            ) : selectedFolder ? (
              <>
                <button className="inline-button album-breadcrumb" type="button" onClick={() => setSelectedFolder(null)}>
                  Back to classifications
                </button>
                <span className="support-note">Events</span>
                <h3 id="past-events-dialog-title">{dialogTitle}</h3>
                <p>{selectedFolder.description}</p>
              </>
            ) : (
              <>
                <span className="support-note">Events</span>
                <h3 id="past-events-dialog-title">{dialogTitle}</h3>
                <p>Browse albums by category, then open any album and its photos.</p>
              </>
            )}
          </div>
        </div>

        {selectedAlbum ? (
          <div className="album-photo-grid">
            {selectedAlbum.photos[0] ? (
              <button
                className="folder-photo album-photo-featured"
                type="button"
                onClick={() => onOpenLightboxImage(selectedAlbum.photos[0])}
              >
                <img src={selectedAlbum.photos[0].src} alt={selectedAlbum.photos[0].alt} />
                <span>{selectedAlbum.photos[0].caption}</span>
              </button>
            ) : null}

            {selectedAlbum.photos.length > 1 ? (
              <div className="album-photo-stack" aria-label="Additional album photos">
                {selectedAlbum.photos.slice(1).map((photo) => (
                  <button className="folder-photo" key={photo.src} type="button" onClick={() => onOpenLightboxImage(photo)}>
                    <img src={photo.src} alt={photo.alt} />
                    <span>{photo.caption}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : selectedFolder ? (
          <div className="folder-grid album-subfolder-grid" aria-label={`${selectedFolder.title} albums`}>
            {selectedFolder.albums.map((album) => (
              <button className="folder-card" key={album.title} type="button" onClick={() => setSelectedAlbum(album)}>
                <div className="folder-card-thumb">
                  <img src={album.cover.src} alt={album.cover.alt} />
                </div>

                <div className="folder-card-copy">
                  <span>{album.label}</span>
                  <h3>{album.title}</h3>
                  <p>{album.photos.length} photos</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="folder-grid album-folder-grid" aria-label="Past event classifications">
            {folders.map((folder) => (
              <button className="folder-card" key={folder.id} type="button" onClick={() => setSelectedFolder(folder)}>
                <div className="folder-card-thumb">
                  <img src={folder.albums[0]?.cover.src} alt={folder.albums[0]?.cover.alt ?? folder.title} />
                </div>

                <div className="folder-card-copy">
                  <span>{folder.title}</span>
                  <h3>{folder.title}</h3>
                  <p>{folder.albums.length} event sets</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
