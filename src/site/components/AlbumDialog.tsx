import { AlbumFolder, EventAlbum, GalleryImage } from "../types";

type AlbumDialogProps = {
  folder: AlbumFolder;
  selectedAlbum: EventAlbum | null;
  onClose: () => void;
  onBack: () => void;
  onSelectAlbum: (album: EventAlbum) => void;
  onOpenLightboxImage: (image: GalleryImage) => void;
};

export function AlbumDialog({
  folder,
  selectedAlbum,
  onClose,
  onBack,
  onSelectAlbum,
  onOpenLightboxImage
}: AlbumDialogProps) {
  return (
    <div className="album-dialog" role="dialog" aria-modal="true" aria-labelledby="album-dialog-title" onClick={onClose}>
      <div className="album-dialog-shell" onClick={(event) => event.stopPropagation()}>
        <button className="lightbox-close album-dialog-close" type="button" onClick={onClose} aria-label="Close dialog">
          ×
        </button>

        <div className="album-dialog-header">
          <div>
            {selectedAlbum ? (
              <>
                <button className="inline-button album-breadcrumb" type="button" onClick={onBack}>
                  Back to {folder.title}
                </button>
                <span className="support-note">{selectedAlbum.label}</span>
                <h3 id="album-dialog-title">{selectedAlbum.title}</h3>
                <p>{selectedAlbum.summary}</p>
              </>
            ) : (
              <>
                <span className="support-note">Events</span>
                <h3 id="album-dialog-title">{folder.title}</h3>
                <p>{folder.description}</p>
              </>
            )}
          </div>
        </div>

        {selectedAlbum ? (
          <div className="folder-photo-grid album-photo-grid">
            {selectedAlbum.photos.map((photo) => (
              <button className="folder-photo" key={photo.src} type="button" onClick={() => onOpenLightboxImage(photo)}>
                <img src={photo.src} alt={photo.alt} />
                <span>{photo.caption}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="folder-grid album-subfolder-grid" aria-label={`${folder.title} subfolders`}>
            {folder.albums.map((album) => (
              <button className="folder-card" key={album.title} type="button" onClick={() => onSelectAlbum(album)}>
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
        )}
      </div>
    </div>
  );
}
